const routes = (handler) => [
  { method: 'POST', 
    path: '/playlists', 
    handler: handler.postPlaylistHandler
  },
  { method: 'GET', 
    path: '/playlists', 
    handler: handler.getPlaylistsHandler
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.postSongToPlaylistHandler,
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getSongsInPlaylistHandler,
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deleteSongFromPlaylistHandler,
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: handler.getPlaylistActivitiesHandler,
  },
];
export default routes;
