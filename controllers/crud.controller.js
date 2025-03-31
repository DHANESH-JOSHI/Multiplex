const crudService = require('../services/crud.service');

exports.create = async (req, res) => {
  try {
    const data = await crudService.create(req.params.model, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.readAll = async (req, res) => {
  try {
    const data = await crudService.readAll(req.params.model);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.readOne = async (req, res) => {
  try {
    const data = await crudService.readOne(req.params.model, req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await crudService.update(req.params.model, req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await crudService.remove(req.params.model, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
