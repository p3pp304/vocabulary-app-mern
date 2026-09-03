import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res)=>{
    res.send('Benvenuto')
})
app.get('/home', (req, res)=>{
    res.send('Sim trnat');
})

app.listen(port, ()=>{
    console.log(`Il server è in ascolto sulla porta ${port}`)
})