// Hello World Function
// A simple example function that returns a greeting

module.exports = async function handler(req, res) {
  const { name = 'World' } = req.query;
  
  return res.status(200).json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
};
