import  express from'express';
import  bodyParser from'body-parser';
import mysql from 'mysql2';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database :"api_rest"
}).promise();

const result = await pool.query("SELECT * FROM tools LEFT JOIN categories ON tools.category_id = categories.id;")


app.get('/tools', (req, res) => {
    res.json(result[0]);
});
app.get('/task/:id', (req, res) => {
    const taskID = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskID);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
});
app.post('/tasks', (req, res) => {
    const newTask =
    { id : tasks.length +1,
         description : req.body.description };
    tasks.push(newTask);
    res.status(201).json({message :'Task created successfully', task: newTask});
    });
    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});