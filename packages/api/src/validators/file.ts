import Joi from 'joi';

export const validateFileUpload = (data: any) => {
  const schema = Joi.object({
    tags: Joi.string().allow('').optional(),
  });

  return schema.validate(data);
};
