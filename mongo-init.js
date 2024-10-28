db.auth('admin', 'password123')

db = db.getSiblingDB('file-sharing-app')

db.createUser({
  user: 'file_sharing_user',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'file-sharing-app',
    },
  ],
});

db.createCollection('users');
db.createCollection('files');
