const functions = require('firebase-functions');
const express = require('express')
const admin = require('firebase-admin')
const cors = require("cors");

const app = express()

app.use(cors({ origin: true }));

app.get('/holamundo', (req, res) => {
    return res.status(200).send('Hola mundo, soy el primer endpoint');
});

var permisos = require("./permisos.json");

admin.initializeApp({
  credential: admin.credential.cert(permisos),
  databaseURL: "https://YOUR_URL.firebaseio.com"
});

const db = admin.firestore();

// create
app.post('/api/libros', (req, res) => {
    (async () => {
        try {
          await db.collection('libros').doc('/' + req.body.id + '/')
              .create({titulo: req.body.titulo});
          return res.status(200).send(salida("200", "Libro creado correctamente"));
        } catch (error) {
          console.log(error);
          return res.status(500).send(salida("500", error));
        }
    })();
});

// read all
app.get("/api/libros", async (req, res) => {
  try{
      
      let query = db.collection("libros");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;

      const response = docs.map((doc) => ({
          id: doc.id,
          titulo: doc.data().titulo,
      }));

      return res.status(200).json(salida("200", response));
  } catch (error) {
      return res.status(500).json(salida("500", error));
  }
})

// read one
app.get('/api/libros/:libro_id', (req, res) =>{
  (async () => {
      try{
          const doc = db.collection('libros').doc(req.params.libro_id);
          const item = await doc.get()
              const response = item.data();
              return res.status(200).json(salida("200", response))
      } catch(error) {
          return res.status(500).send(salida("500", error));
      }
  })();
});

// update
app.put("/api/libros/:libros_id", async (req, res) => {
  try {      
      const document = db.collection("libros").doc(req.params.libros_id);
      
      await document.update({
          nombre: req.body.nombre,
      });
      
      return res.status(200).json(salida("200", "El libro ha sido actualizado"));
  } catch (error) {
    return res.status(500).json(salida("500", error));
  }
});

// delete
app.delete("/api/libros/:libros_id", async (req, res) => {
  try {
    const doc = db.collection("libros").doc(req.params.libros_id);
    await doc.delete();
    return res.status(200).json(salida("200", "El libros ha sido borrado exitosamente"));
  } catch (error) {
    return res.status(500).send(salida("500", error));
  }
});

function salida(codigo, entrada){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+"|"+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  
  if(codigo === "200") return {
      mensaje : "Proceso terminado exitosamente",
      folio : date,
      resultado : entrada
  }

  if(codigo === "201") return {
      mensaje : "Elemento creado exitosamente",
      folio : date,
      resultado : entrada
  }

  if(codigo === "500") return {
      mensaje: "Ocurrio un detalle en el servidor",
      folio : date,
      resultado : entrada
  }

  return {
      mensaje: "Ocurrio un detalle en el servidor",
      folio : date,
      resultado : entrada
  }
}

exports.app = functions.https.onRequest(app);