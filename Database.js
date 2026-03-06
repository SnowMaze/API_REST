import mysql from 'mysql2';

let pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database :"api_rest"
}).promise();

export async function existsTool(id) {
    const [resultTools] = await pool.query("SELECT * FROM tools WHERE id = ?", [id]);
    return resultTools.length > 0;
}
export async function existsCategory(category_id) {
    const [resultCategories] = await pool.query("SELECT * FROM categories WHERE id = ?", [category_id]);
    return resultCategories.length > 0;
}
export async function getTools() {
    const [resultTools] = await pool.query("SELECT tools.*,categories.name as category "+
                                        "FROM tools LEFT JOIN categories ON tools.category_id = categories.id;");
    return resultTools[0];
}
export async function getTool(id) {
    const [resultTools] = await pool.query("SELECT tools.*,categories.name as category, SUM(usage_logs.tool_id) as total_sessions,"+
                                        " AVG(usage_logs.usage_minutes) as avg_session_minutes "+
                                        "FROM tools LEFT JOIN categories ON tools.category_id = categories.id "+
                                        "LEFT JOIN usage_logs ON tools.id = usage_logs.tool_id "+
                                        "WHERE tools.id = ?", [id]);
    return resultTools[0];
}
export async function getToolStatus(department,status) {
    const [resultTools] = await pool.query("SELECT tools.*,categories.name as category "+
                                        "FROM tools LEFT JOIN categories ON tools.category_id = categories.id "+   
                                        "WHERE tools.owner_department = ? AND tools.status = ?", [department,status]);
    return resultTools[0];
}
export async function getToolsByCostAndCategory(min_cost,max_cost,category_name) {
    const [resultTools] = await pool.query("SELECT  tools.*,categories.name as category  "+
                                        "FROM tools LEFT JOIN categories ON tools.category_id = categories.id"+
                                        "WHERE tools.Monthly_cost BETWEEN ? AND ? AND categories.name = ?", [min_cost,max_cost,category_name]);
    return resultTools[0];
}

export async function CreateTool(name, description, vendor, website_url, owner_department, monthly_cost, category_id) {
    const [resultTools] = await pool.query("INSERT INTO tools (name, description, vendor, website_url, owner_department,category_id,monthly_cost )"+ 
                                        " VALUES (?, ?, ?, ?, ?, ?, ?)", 
                                        [name, description, vendor, website_url, owner_department, monthly_cost, category_id]);                                 
    return getTool(resultTools.insertId);
}
