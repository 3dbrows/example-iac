from aws_cdk import App, Stack, Tags
from aws_cdk import aws_ec2 as ec2
from aws_cdk import aws_lambda as lambda_
from aws_cdk import aws_rds as rds
from constructs import Construct


class WebAppStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        instance = ec2.Instance(
            self,
            "MyWebApp",
            instance_type=ec2.InstanceType("m3.xlarge"),  # <<<<<<<<<< Try changing this to m5.xlarge to compare the costs
            machine_image=ec2.MachineImage.generic_linux({
                "us-east-1": "ami-005e54dee72cc1d00"
            }),
            block_devices=[
                ec2.BlockDevice(
                    device_name="/dev/xvda",
                    volume=ec2.BlockDeviceVolume.ebs(1000)  # <<<<<<<<<< Try adding volume_type=gp3 to compare costs
                )
            ],
            vpc=ec2.Vpc.from_lookup(self, "VPC", is_default=True),
        )
        Tags.of(instance).add("Environment", "production")
        Tags.of(instance).add("Service", "web-app")
        Tags.of(instance).add("Name", "dash")

        fn = lambda_.Function(
            self,
            "MyHelloWorld",
            runtime=lambda_.Runtime.NODEJS_12_X,
            handler="exports.test",
            code=lambda_.Code.from_inline("exports.test = () => {}"),
            function_name="test",
            memory_size=512,
        )
        Tags.of(fn).add("Environment", "Prod")

        db = rds.DatabaseInstance(
            self,
            "MyDatabase",
            engine=rds.DatabaseInstanceEngine.mysql(
                version=rds.MysqlEngineVersion.VER_5_7_44
            ),
            instance_type=ec2.InstanceType("c5.2xlarge"),
            allocated_storage=20,
            database_name="exampledb",
            credentials=rds.Credentials.from_username("admin"),
            vpc=ec2.Vpc.from_lookup(self, "DbVPC", is_default=True),
            deletion_protection=False,
        )
        Tags.of(db).add("Name", "my-db")


app = App()
WebAppStack(app, "WebAppStackPython", env={"account": "123456789012", "region": "us-east-1"})
app.synth()
