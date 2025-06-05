import Joi from 'joi';

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostPlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

export { 
  PostPlaylistPayloadSchema, 
  PostPlaylistSongPayloadSchema
};