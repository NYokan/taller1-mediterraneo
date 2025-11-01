// 1. Importar las dependencias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// (¡IMPORTANTE! En un proyecto real, 'tu_secreto_jwt' debe estar en un archivo .env)
const JWT_SECRET = 'tu_secreto_jwt';

// 6. --- MIDDLEWARE DE AUTENTICACIÓN ---
// Esta función revisará el token en las rutas protegidas
const autenticar = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado: No se proveyó token' });
    }

    try {
        const verificado = jwt.verify(token, JWT_SECRET);
        req.usuario = verificado; // Adjuntamos los datos del usuario (id, rol) al request
        next(); // El token es válido, continuamos al endpoint
    } catch (err) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

// Middleware para verificar si el usuario es Admin
const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Requiere rol de administrador' });
    }
    next(); // Es admin, continuamos
};

// 2. Configuración básica del servidor
const app = express();
const port = 4000; // Puerto para el backend

// 3. Middlewares
app.use(cors()); // Permite que tu frontend se comunique con el backend
app.use(express.json()); // Permite al servidor entender el JSON que envías

// 4. Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',       // Tu servidor de XAMPP
    user: 'root',            // El usuario por defecto de XAMPP
    password: '',            // La contraseña por defecto de XAMPP es vacía
    database: 'la_terraza'   // La base de datos que creamos
});

// 5. Probar la conexión a la Base de Datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado exitosamente a la base de datos MySQL (la_terraza)');
});

// 6. --- ENDPOINTS DE PRODUCTOS ---

// [US-Prod-01] Obtener todos los productos (para el menú)
app.get('/api/v1/productos', (req, res) => {
    const sql = 'SELECT * FROM Producto';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al consultar productos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        
        // Si todo sale bien, devuelve los productos
        res.json(results);
    });
});
// --- ENDPOINTS DE REPORTES (ADMIN) ---

// [US-Admin-02] Obtener estadísticas de ventas (Protegido por Admin)
app.get('/api/v1/reportes/ventas', [autenticar, esAdmin], (req, res) => {

    // Query para el total de ventas y cantidad de pedidos
    const sqlTotal = 'SELECT SUM(total_pedido) AS total_ventas, COUNT(id) AS cantidad_pedidos FROM Pedido';

    // Query para el producto más vendido
    const sqlPopular = `
        SELECT p.nombre_plato, SUM(dp.cantidad) AS total_vendido
        FROM DetallePedido dp
        JOIN Producto p ON dp.producto_id = p.id
        GROUP BY p.nombre_plato
        ORDER BY total_vendido DESC
        LIMIT 1
    `;

    db.query(sqlTotal, (err, resultTotal) => {
        if (err) {
            console.error('Error al calcular reportes (total):', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        db.query(sqlPopular, (err, resultPopular) => {
            if (err) {
                console.error('Error al calcular reportes (popular):', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            const reportes = {
                total_ventas: resultTotal[0].total_ventas || 0,
                cantidad_pedidos: resultTotal[0].cantidad_pedidos || 0,
                producto_popular: resultPopular.length > 0 ? resultPopular[0].nombre_plato : '-'
            };

            res.json(reportes);
        });
    });
});
    // [US-Cliente-01] Obtener el historial de pedidos de un usuario (Protegido)
    app.get('/api/v1/pedidos/historial', autenticar, (req, res) => {
        // Obtenemos el ID del usuario desde el token que ya fue verificado
        const usuario_id = req.usuario.id;

        const sql = `
            SELECT id, fecha_pedido, total_pedido, nombre_cliente, direccion_envio, metodo_pago 
            FROM Pedido 
            WHERE usuario_id = ? 
            ORDER BY fecha_pedido DESC
        `;

        db.query(sql, [usuario_id], (err, results) => {
            if (err) {
                console.error('Error al consultar historial de pedidos:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Devolvemos la lista de pedidos del usuario
            res.json(results);
        });
    });
// --- ENDPOINTS DE PEDIDOS (CLIENTE) ---

// [US-Ped-01] Crear un nuevo pedido (Protegido por Clientes/Admin)
app.post('/api/v1/pedidos', autenticar, (req, res) => {
    // Obtenemos el ID del usuario desde el token que ya fue verificado
    const usuario_id = req.usuario.id;
    
    // Obtenemos los datos del formulario de pago y el carrito
    const { info_cliente, items, total_pedido } = req.body;

    // Validación
    if (!info_cliente || !items || !total_pedido || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos en el pedido' });
    }

    // Usamos una transacción para asegurar que ambas tablas se actualicen
    db.beginTransaction(err => {
        if (err) {
            console.error('Error al iniciar transacción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 1. Insertar en la tabla 'Pedido'
        const sqlPedido = `INSERT INTO Pedido (usuario_id, total_pedido, nombre_cliente, direccion_envio, metodo_pago) 
                           VALUES (?, ?, ?, ?, ?)`;
        const paramsPedido = [
            usuario_id,
            total_pedido,
            info_cliente.nombre,
            info_cliente.direccion,
            info_cliente.metodo_pago
        ];

        db.query(sqlPedido, paramsPedido, (err, resultPedido) => {
            if (err) {
                console.error('Error al insertar en Pedido:', err);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Error al guardar el pedido' });
                });
            }

            const nuevoPedidoId = resultPedido.insertId;

            // 2. Preparar los datos para 'DetallePedido'
            const sqlDetalle = 'INSERT INTO DetallePedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ?';
            
            const valuesDetalle = items.map(item => [
                nuevoPedidoId,
                item.producto_id,
                item.cantidad,
                item.precio_unitario
            ]);

            // 3. Insertar todos los items en 'DetallePedido'
            db.query(sqlDetalle, [valuesDetalle], (err, resultDetalle) => {
                if (err) {
                    console.error('Error al insertar en DetallePedido:', err);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error al guardar los detalles del pedido' });
                    });
                }

                // 4. ¡Éxito! Confirmar la transacción
                db.commit(err => {
                    if (err) {
                        console.error('Error al confirmar transacción:', err);
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Error al finalizar el pedido' });
                        });
                    }

                    // Devolvemos la respuesta exitosa
                    res.status(201).json({
                        mensaje: 'Pedido creado exitosamente',
                        pedidoId: nuevoPedidoId
                    });
                });
            });
        });
    });
});
// [US-Admin-01] Crear un nuevo producto (Protegido por Admin)
app.post('/api/v1/productos', [autenticar, esAdmin], (req, res) => {
    const { nombre_plato, descripcion, precio, imagen_url } = req.body;
    
    if (!nombre_plato || !precio || !imagen_url) {
        return res.status(400).json({ error: 'Nombre, precio e imagen_url son obligatorios' });
    }

    const sql = 'INSERT INTO Producto (nombre_plato, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre_plato, descripcion, precio, imagen_url], (err, result) => {
        if (err) {
            console.error('Error al crear producto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json({ mensaje: 'Producto creado', productoId: result.insertId });
    });
});

// [US-Admin-01] Actualizar un producto (Protegido por Admin)
app.put('/api/v1/productos/:id', [autenticar, esAdmin], (req, res) => {
    const { id } = req.params;
    const { nombre_plato, descripcion, precio, imagen_url } = req.body;

    if (!nombre_plato || !precio || !imagen_url) {
        return res.status(400).json({ error: 'Nombre, precio e imagen_url son obligatorios' });
    }

    const sql = 'UPDATE Producto SET nombre_plato = ?, descripcion = ?, precio = ?, imagen_url = ? WHERE id = ?';
    db.query(sql, [nombre_plato, descripcion, precio, imagen_url, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto actualizado' });
    });
});

// [US-Admin-01] Eliminar un producto (Protegido por Admin)
app.delete('/api/v1/productos/:id', [autenticar, esAdmin], (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM Producto WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado' });
    });
});

// --- ENDPOINTS DE AUTENTICACIÓN ---

// [US-Auth-01] Registro de nuevo cliente
app.post('/api/v1/auth/registrar', async (req, res) => {
    const { nombre_usuario, email, password } = req.body;

    // Validar que los datos llegaron
    if (!nombre_usuario || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // 1. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // --- MODIFICACIÓN AQUÍ ---
        // Determinar el rol basado en el email
        const rol = (email === 'admin@laterraza.cl') ? 'admin' : 'cliente';
        // --- FIN DE LA MODIFICACIÓN ---

        // 2. Crear el query SQL (¡AHORA INCLUYE EL ROL!)
        const sql = 'INSERT INTO Usuario (nombre_usuario, email, password_hash, rol) VALUES (?, ?, ?, ?)';
        
        // 3. Ejecutar el query (¡AHORA INCLUYE EL ROL!)
        db.query(sql, [nombre_usuario, email, password_hash, rol], (err, result) => {
            if (err) {
                // Error de email duplicado (MySQL error code 1062)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'El email ya está registrado' });
                }
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            
            // 4. Éxito
            res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
        });

    } catch (error) {
        console.error('Error al hashear contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// [US-Auth-02] Inicio de sesión de usuario
app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // 1. Buscar al usuario por email
    const sql = 'SELECT * FROM Usuario WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error al consultar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 2. Verificar si el usuario existe
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' }); // Usuario no encontrado
        }

        const usuario = results[0];

        try {
            // 3. Comparar la contraseña enviada con el hash de la BD
            const match = await bcrypt.compare(password, usuario.password_hash);

            if (!match) {
                return res.status(401).json({ error: 'Credenciales inválidas' }); // Contraseña incorrecta
            }

            // 4. Crear el Token (JWT)
            const payload = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            };
            
            // Usamos la constante JWT_SECRET definida al inicio
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 

            // 5. Enviar respuesta exitosa
            res.json({
                token: token,
                usuario: {
                    email: usuario.email,
                    rol: usuario.rol,
                    nombre: usuario.nombre_usuario
                }
            });

        } catch (error) {
            console.error('Error al comparar contraseña:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});


// (Aquí agregaremos más endpoints después)


// 7. Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});