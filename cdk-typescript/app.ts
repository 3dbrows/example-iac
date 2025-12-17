import { App, Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const instance = new ec2.Instance(this, 'MyWebApp', {
      instanceType: new ec2.InstanceType('m5.xlarge'), // <<<<<<<<<< Try changing this to m5.xlarge to compare the costs
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

    const instance = new ec2.Instance(this, 'MyWebApp', { // duplicate of same ID
      instanceType: new ec2.InstanceType('m5.2xlarge'), // <<<<<<<<<< Try changing this to m5.xlarge to compare the costs
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
new WebAppStack(app, 'WebAppStackTypeScript', { env: { account: '123456789012', region: 'us-east-1' } });
app.synth();
