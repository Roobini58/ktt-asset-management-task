import * as categoryRepository from '../repositories/category.repository.js';

export const getAllCategories = async () => {
  return await categoryRepository.findAll([['name', 'ASC']]);
};

export const getCategoryById = async (id) => {
  return await categoryRepository.findByPk(id);
};

export const createCategory = async (data) => {
  return await categoryRepository.create({
    name: data.name,
    description: data.description || null
  });
};

export const updateCategory = async (id, data) => {
  const category = await categoryRepository.findByPk(id);
  if (!category) return null;

  return await categoryRepository.update(category, {
    name: data.name,
    description: data.description || null
  });
};
