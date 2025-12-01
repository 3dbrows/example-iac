const { App, Stack, Tags } = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const lambda = require('aws-cdk-lib/aws-lambda');
const rds = require('aws-cdk-lib/aws-rds');

class WebAppStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const instance = new ec2.Instance(this, 'MyWebApp', {
      instanceType: new ec2.InstanceType('m3.xlarge'), // <<<<<<<<<< Try changing this to m5.xlarge to compare the costs
      machineImage: ec2.MachineImage.genericLinux({
        'us-east-1': 'ami-005e54dee72cc1d00',
      }),
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(1000), // <<<<<<<<<< Try adding volumeType: gp3 to compare costs
        },
      ],
      vpc: ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true }),
    });
    Tags.of(instance).add('Environment', 'production');
    Tags.of(instance).add('Service', 'web-app');
    Tags.of(instance).add('Name', 'dash');

    const fn = new lambda.Function(this, 'MyHelloWorld', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'exports.test',
      code: lambda.Code.fromInline('exports.test = () => {}'),
      functionName: 'test',
      memorySize: 512,
    });
    Tags.of(fn).add('Environment', 'Prod');

    const db = new rds.DatabaseInstance(this, 'MyDatabase', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_5_7_44,
      }),
      instanceType: new ec2.InstanceType('c5.2xlarge'),
      allocatedStorage: 20,
      databaseName: 'exampledb',
      credentials: rds.Credentials.fromUsername('admin'),
      vpc: ec2.Vpc.fromLookup(this, 'DbVPC', { isDefault: true }),
      deletionProtection: false,
    });
    Tags.of(db).add('Name', 'my-db');
  }
}

const app = new App();
new WebAppStack(app, 'WebAppStackJavaScript', { env: { account: '123456789012', region: 'us-east-1' } });
app.synth();
