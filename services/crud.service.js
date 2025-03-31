const getModel = (modelName) => require(`../models/${modelName}.model`);

const create = async (modelName, data) => {
  const Model = getModel(modelName);
  return await Model.create(data);
};

const readAll = async (modelName) => {
  const Model = getModel(modelName);
  return await Model.find();
};

const readOne = async (modelName, id) => {
  const Model = getModel(modelName);
  return await Model.findById(id);
};

const update = async (modelName, id, data) => {
  const Model = getModel(modelName);
  return await Model.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (modelName, id) => {
  const Model = getModel(modelName);
  return await Model.findByIdAndDelete(id);
};

module.exports = {
  create,
  readAll,
  readOne,
  update,
  remove,
};
