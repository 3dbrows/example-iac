provider "aws" {
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
}

resource "aws_instance" "my_web_app" {
  ami = "ami-005e54dee72cc1d00"

  instance_type = "m3.xlarge" # <<<<<<<<<< Try changing this to m5.xlarge to compare the costs

  tags = {
    Environment = "production"
    Service     = "web-app"
    Name        = "dash"
  }

  root_block_device {
    volume_size = 1000 # <<<<<<<<<< Try adding volume_type="gp3" to compare costs
  }
}

resource "aws_lambda_function" "my_hello_world" {
  runtime       = "nodejs12.x"
  handler       = "exports.test"
  image_uri     = "test"
  function_name = "test"
  role          = "arn:aws:ec2:us-east-1:123123123123:instance/i-1231231231"

  memory_size = 512
  tags = {
    Environment = "Prod"
  }
}

resource "aws_secretsmanager_secret" "my_db_secret" {
  name = "my-db-secret"
}

resource "aws_secretsmanager_secret_version" "my_db_secret_version" {
  secret_id = aws_secretsmanager_secret.my_db_secret.id
  secret_string = jsonencode({
    username = "admin"
    password = "yourpassword"
  })
}

resource "aws_db_instance" "my_db" {
  identifier          = "mysql57-extended"
  engine              = "mysql"
  engine_version      = "5.7.44"
  instance_class      = "c5.2xlarge"
  allocated_storage   = 20
  username            = jsondecode(aws_secretsmanager_secret_version.my_db_secret_version.secret_string)["username"]
  password            = jsondecode(aws_secretsmanager_secret_version.my_db_secret_version.secret_string)["password"]
  db_name             = "exampledb"
  publicly_accessible = false
  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "my-db"
  }
}
