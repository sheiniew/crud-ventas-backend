import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


app.post("/productos", async (req, res) => {
    const { nombre, precio } = req.body;

    const { data, error } = await supabase
        .from("productos")
        .insert([{ nombre, precio }]);

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.put("/productos/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    const { error } = await supabase
        .from("productos")
        .update({ nombre, precio })
        .eq("id_producto", Number(id));

    if (error) return res.status(400).json(error);

    res.json({ message: "Producto actualizado" });
});

app.delete("/productos/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id_producto", Number(id));

    if (error) return res.status(400).json(error);

    res.json({ message: "Producto eliminado" });
});

app.get("/productos", async (req, res) => {

    const { data, error } = await supabase.from("productos").select("*");

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.post("/venta", async (req, res) => {
    const { id_cliente, id_producto, cantidad } = req.body;

    console.log({
        p_cliente_id: id_cliente,
        p_id_producto: id_producto,
        p_cantidad: cantidad,
    });

    const { error } = await supabase.rpc("registrar_venta", {
        p_cliente_id: id_cliente,
        p_id_producto: id_producto,
        p_cantidad: cantidad,
    });

    if (error) {
        console.error("SUPABASE ERROR:", error);
        return res.status(400).json(error);
    }
    res.json({ message: "Venta registrada" });
});

app.get("/ventas-cliente/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("ventas_por_cliente", {
        p_cliente_id: Number(id),
    });

    console.log(data);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        return res.status(400).json(error);
    }

    res.json(data);
});

app.get("/total/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("total_por_cliente", {
        p_cliente_id: Number(id),
    });

    if (error) return res.status(400).json(error);
    res.json({ total: data });
});


app.get("/clientes", async (req, res) => {
    const { data, error } = await supabase.from("clientes").select("*");

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.post("/clientes", async (req, res) => {
    const { nombre, correo } = req.body;

    const { data, error } = await supabase
        .from("clientes")
        .insert([{ nombre, correo }]);

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.listen(3000, () => console.log("Servidor corriendo en 3000"));