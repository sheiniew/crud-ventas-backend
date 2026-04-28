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
    const { nombre, precio, stock } = req.body;

    if (!nombre || !precio || stock === undefined) {
        return res.status(400).json({
            error: "Todos los campos son obligatorios"
        });
    }

    const { data, error } = await supabase
        .from("productos")
        .insert([{
            nombre,
            precio: Number(precio),
            stock: Number(stock)
        }]);

    if (error) return res.status(400).json(error);

    res.json(data);
});

app.put("/productos/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    const { error } = await supabase
        .from("productos")
        .update({ nombre, precio, stock })
        .eq("id_producto", Number(id));

    if (error) return res.status(400).json(error);

    res.json({ message: "Producto actualizado" });
});

app.get("/productos", async (req, res) => {
    const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true);

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.get("/productos/inactivos", async (req, res) => {
    const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", false);

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.put("/productos/desactivar/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from("productos")
        .update({ activo: false })
        .eq("id_producto", Number(id));

    if (error) return res.status(400).json(error);

    res.json({ message: "Producto desactivado" });
});

app.put("/productos/reactivar/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from("productos")
        .update({ activo: true })
        .eq("id_producto", Number(id));

    if (error) return res.status(400).json(error);

    res.json({ message: "Producto reactivado" });
});

app.post("/venta", async (req, res) => {
    try {
        const { id_cliente, id_producto, cantidad, id_empleado } = req.body;

        const { data, error } = await supabase.rpc("registrar_venta", {
            p_cliente_id: id_cliente,
            p_id_producto: id_producto,
            p_cantidad: cantidad,
            p_id_empleado: id_empleado,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.json({
            message: "Venta registrada con éxito",
            data
        });

    } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.get("/ventas-cliente/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("ventas_por_cliente", {
        p_cliente_id: Number(id),
    });

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
        .insert([{ nombre, correo }])
        .select()
        .single();

    if (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "El correo ya está registrado"
            });
        }
        return res.status(400).json(error);
    }

    return res.status(201).json(data);
});

app.get("/empleados", async (req, res) => {
    const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .eq("activo", true);

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.get("/empleados/inhabilitados", async (req, res) => {
    const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .eq("activo", false);

    if (error) return res.status(400).json(error);

    res.json(data);
});

app.put("/empleados/reactivar/:id", async (req, res) => {
    const { id } = req.params;

    await supabase
        .from("empleados")
        .update({ activo: true })
        .eq("id_empleado", Number(id));

    res.json({ message: "Empleado reactivado" });
});

app.post("/empleados", async (req, res) => {
    const { nombre, cargo, correo } = req.body;

    const { data, error } = await supabase
        .from("empleados")
        .insert([{ nombre, cargo, correo }]);

    if (error) return res.status(400).json(error);
    res.json(data);
});


app.put("/empleados/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, cargo, correo } = req.body;

    const { error } = await supabase
        .from("empleados")
        .update({ nombre, cargo, correo })
        .eq("id_empleado", Number(id));

    if (error) return res.status(400).json(error);
    res.json({ message: "Actualizado" });
});

app.delete("/empleados/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from("empleados")
        .update({ activo: false })
        .eq("id_empleado", Number(id));

    if (error) return res.status(400).json(error);

    res.json({ message: "Empleado desactivado" });
});

app.get("/auditoria-empleados", async (req, res) => {
    const { data, error } = await supabase
        .from("auditoria_empleados")
        .select("*")
        .order("fecha", { ascending: false });

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.get("/auditoria-empleado/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("auditoria_empleados")
        .select("*")
        .or(`datos_nuevos->>id_empleado.eq.${id},datos_anteriores->>id_empleado.eq.${id}`)
        .order("fecha", { ascending: false });

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.get("/ventas-empleado", async (req, res) => {
    const { data, error } = await supabase.rpc("ventas_por_empleado");

    if (error) return res.status(400).json(error);
    res.json(data);
});

app.get("/ventas-empleado/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("ventas")
        .select(`
      id_venta,
      fecha,
      detalle_venta (
        cantidad,
        precio_unitario,
        productos (
          nombre
        )
      )
    `)
        .eq("id_empleado", Number(id));

    if (error) {
        console.error(error);
        return res.status(400).json(error);
    }

    res.json(data);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${PORT}`);
});