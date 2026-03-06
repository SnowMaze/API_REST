import  express from'express';
import  bodyParser from'body-parser';
import mysql from 'mysql2';
import * as db  from './Database.js';
import e from 'express';
const app = express();
const PORT = 3000;
const urlRegex = /(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?|www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/gi;
app.use(bodyParser.json());


app.get('/api/tools',async (req, res) => {
    res.json(await db.getTools());
});
app.get('/api/tools/:id', async (req, res) => {
    if (!res) {
        return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(await db.getTool(req.params.id));
});
app.get('/api/tools/:department/:status', async (req, res) => {
    if (!res) {
        return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(await db.getToolStatus(req.params.department, req.params.status));
});
app.get('/api/tools/:min_cost/:max_cost/:category_name', async (req, res) => {
    if (!res) {
        return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(await db.getToolsByCostAndCategory(req.params.min_cost, req.params.max_cost, req.params.category_name));
});

app.post('/api/tools', async (req, res) => {
    const { name, description,vendor, website_url, owner_department,category_id, monthly_cost  } = req.body;
    if (name){
        if (monthly_cost>0){
            if(owner_department=="Engineering" 
                || owner_department=="Marketing" 
                || owner_department=="Sales"
                || owner_department=="HR"
                || owner_department=="Finance"
                || owner_department=="Operations"
                || owner_department=="Design"){
                    if(vendor){
                        if(website_url.match(urlRegex)){
                            const exist = await db.existsCategory(category_id)
                            if (exist){
                                 const newTool = await db.CreateTool(name, description, vendor, website_url, owner_department, category_id, monthly_cost);
                                 res.status(201).send({ message: 'Tool created successfully', tool: newTool});
                            }else{
                                res.status(400).json({ error: 'category ID Doesn\'t exists '});
                            }
                        }else{
                            res.status(400).json({ error: 'Invalid website URL' });
                        }
                        
                    }else{
                        res.status(400).json({ error: 'Vendor is required' });   
                    }
                }else{
                    res.status(400).json({ error: 'Invalid owner department Engineering||Marketing||Sales||HR||Finance||Operations||Design' });
                }
        }else{
            res.status(400).json({ error: 'Monthly cost must be greater than 0' });
        }
    }else{
        res.status(400).json({ error: 'Name is required' });
    }

}); 
app.put('/api/tools/:id', async (req, res) => { 
    const updates = req.body;
    const id = req.params.id;
    const tool = await db.getTool(id);
    
    Object.keys(updates).forEach((key) => {
        if (tool.hasOwnProperty(key)) {
            if(updates[key]===""&& key==="name"){
                return res.status(400).json({ error: 'Name is required' });
            }else{
                if(key==="monthly_cost" && updates[key]<=0){
                    return res.status(400).json({ error: 'Monthly cost must be greater than 0' });
                }else{
                    if(key==="owner_department" && !(updates[key]=="Engineering" 
                    || updates[key]=="Marketing" 
                    || updates[key]=="Sales"
                    || updates[key]=="HR"
                    || updates[key]=="Finance"
                    || updates[key]=="Operations"
                    || updates[key]=="Design")){
                        return res.status(400).json({ error: 'Invalid owner department Engineering||Marketing||Sales||HR||Finance||Operations||Design' });
                    }else{
                        if(key==="website_url" && !updates[key].match(urlRegex)){
                            return res.status(400).json({ error: 'Invalid website URL' });
                        }else{
                            if (key==="vendor"&& updates[key]===""){
                                    return res.status(400).json({ error: 'Vendor is required' });   
                                }else{
                                    if(key==="status" && !(updates[key]=="active" 
                                    || !updates[key]=="deprecated"
                                    || !updates[key]=="trial"  )){
                                        return res.status(400).json({ error: 'Invalid status active||deprecated||trial' });
                                    }else{
                                         tool[key] = updates[key]; 
                                    }
    
                                }
                        }
                    }
                }
            }
        }   
    });
    tool["updated_at"] = new Date();
    res.json({
    message: "tool updated successfully",
    data: tool
  });
});
app.use((err,req, res) => {
    console.log(err.stack);
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});