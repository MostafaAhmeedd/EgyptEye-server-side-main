const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

const s3Client = new S3Client({
    region: 'us-east-1', // Set the appropriate region for your DigitalOcean Spaces bucket
    endpoint: "https://nyc3.digitaloceanspaces.com",
    credentials: {
        accessKeyId: process.env.SPACE_ACCESS_KEY,
        secretAccessKey: process.env.SPACE_SECRET_KEY,
    },
});
  
const uploadToSpace = async (file) => {
    console.log(file)
    const fileContent = fs.readFileSync(file.path ?? null);
    const imgName = new Date().getTime() + '-' + file.originalname
    const params = {
        Bucket: 'egypteye-space-1',
        Key: imgName,
        Body: fileContent,
        ACL:'public-read'
    }; 
    try { 
        // Create the PutObject command
        const command = new PutObjectCommand(params);
    
        // Upload the file to S3
        const response = await s3Client.send(command);
        const imageUrl = `${process.env.SPACE_ORIGIN}/${imgName}`;
        console.log('File uploaded successfully');
        return imageUrl
      } catch (error) {
        console.error('Error uploading file:', error);
        return null
      } 
      /*
    const command = new PutObjectCommand(params);
    console.log(command)
    await s3Client.send(command);
    //console.log(response, 2000);
    const imageUrl = `${process.env.SPACE_ORIGIN}/${(new Date().getTime())}-${file.originalname}`;
    
    return imageUrl
    */
}

module.exports = {uploadToSpace}