# Challenger Server Browser/Match making UI backend processor

This is node based background process to fetch server details from Steam and get Geolocation frop ipapi (https://ipapi.co/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You should have node installed on your enviorment

### Installing

Open command prompt in directory location and type "npm install" command to fetch all required node packages

Please run 'chal_server_table_alter.sql' to update current chal_server table under wordpress database

Change database configuration in config.json file-
"DBSetting":{
        "Username" : "root",
        "Password":"root",
        "Host":"127.0.0.1",
        "Database":"wordpress"
        }
        
Please make sure database is accessible from node enviorment

## Authors

* **Vivek Samant** - *Initial work* - [vivekatdrive](https://github.com/vivekatdrive)

