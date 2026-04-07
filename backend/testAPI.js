const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Probando conexión al backend...');

    // Primero probar GET
    const getResponse = await axios.get('http://localhost:3000/api/categorias');
    console.log('✅ GET funciona:', getResponse.data);

    // Ahora probar POST
    console.log('🔍 Probando POST...');
    const postResponse = await axios.post('http://localhost:3000/api/categorias', {
      nombre: 'TestDesdeNode',
      tema_visual: 'verde'
    });
    console.log('✅ POST funciona:', postResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAPI();