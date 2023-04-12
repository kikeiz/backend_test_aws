const {Router} = require('express');
const { DynamoDBClient, PutItemCommand, DeleteItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const { unmarshall } = require('@aws-sdk/util-dynamodb');
const REGION = "us-east-1";
const BUCKET_NAME = "images-node-app-bucket"
const accessKeyId = 'AKIAU75ARUEHMTKRRJWM'
const secretAccessKey = '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'
const credentials = {
    accessKeyId,
    secretAccessKey
}
const config = {
    region: REGION,
    credentials
}

const dynamoDBClient = new DynamoDBClient(config);
const s3Client = new S3Client(config);

const { v4: uuidv4 } = require('uuid');


const router = Router();

router.get('/', (req, res) => {
    res.send('Welcome')
})

router.post('/catalog', ({body: {title, author, mark}}, res) => {
    const bookId = uuidv4()
    const params = {
        TableName: "Catalog",
        Item: {
          "bookId": { S: bookId},
          "title": { S: `${title}` },
          "author": { S: `${author}` },
          "mark": { S: `${mark}` }
        }
    };

    const putItemCommand = new PutItemCommand(params);
    dynamoDBClient.send(putItemCommand)
    .then((response)=> {
        console.log("Item created successfully:", response.$metadata);
        res.status(200).json({
            message: 'ok',
            data: {
                bookId,
                title,
                author,
                mark
            }
        })
    })
    .catch((error) => {
        console.error("Error creating item:", error);
        res.status(500).send()
    })
    
})

router.get('/catalog', (req, res) => {
    const params = {
        TableName: 'Catalog'
    };
    const scanCommand = new ScanCommand(params);
    dynamoDBClient.send(scanCommand)
    .then((data)=> {
        const items = data.Items.map((item) => {
            return unmarshall(item);
        });

        res.status(200).send({
            data: items,
            message: 'Items retrieved successfully'
        })
    })
    .catch((error) => {
        console.error("Error retrieving item:", error);
        res.status(500).send()
    })

})

router.post('/catalog/image', ({files: {photo: {data}}}, res) => {
   const command = new PutObjectCommand({Bucket: BUCKET_NAME, Key: uuidv4(), Body: data})
   s3Client.send(command)
   .then((res)=> {
    console.log(33, res)
   })
   .catch((err) => {
    console.log(33, err)
   })

})

router.put('/film', (req, res) => {
    
})

router.delete('/catalog/:id', ({params: {id}}, res) => {
    console.log(99, id);
    const params = {
        TableName: 'Catalog',
        Key: { bookId: { S: id } } // specify the key of the item to delete
    };
    const deleteItemCommand = new DeleteItemCommand(params);
    dynamoDBClient.send(deleteItemCommand)
    .then((response)=> {
        console.log("Item deleted successfully:", response);
        res.status(200).json({
            message: 'Item deleted successfully',
        })
    })
    .catch((error) => {
        console.error("Error deleting item:", error);
        res.status(500).send()
    })

})

module.exports = router;