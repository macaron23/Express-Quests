const database = require('./database');

const getUsers = (req, res) => {
  let sql = 'select firstname, lastname, email, city, language from users';
  const sqlValues = [];

  if (req.query.language != null) {
    sql += ' where language  = ?';
    sqlValues.push(req.query.language);

    if (req.query.city != null) {
      sql += ' and city = ?';
      sqlValues.push(req.query.city);
    }
  } else if (req.query.city != null) {
    sql += ' where city = ?';
    sqlValues.push(req.query.city);
  }

  console.log('req: ', sql, ' values: ', sqlValues);

  database
    .query(sql, sqlValues)
    .then(([users]) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

const getUsersById = (req, res) => {
  const id = parseInt(req.params.id);
  database
    .query(
      'select firstname, lastname, email, city, language from users where id = ?',
      [id]
    )
    .then(([users]) => {
      if (users[0] != null) {
        res.status(200).json(users[0]);
      } else {
        res.status(404).send('Not Found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;
  console.log('email récupéré : ', email);
  database
    .query(
      'select firstname, lastname, email, city, language, hashedPassword, id from users where email= ?',
      [email]
    )

    .then(([users]) => {
      console.log('user récupéré :', users[0]);
      if (users[0] != null) {
        req.user = users[0];
        console.log('req.user :', req.user);

        next();
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    });
};

const postUsers = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;

  database
    .query(
      'INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving the user');
    });
};

const updateUsers = (req, res) => {
  console.log('updateUsers id : ', req.params.id, ' req body : ', req.body);
  const id = parseInt(req.params.id);
  console.log('updateUsers id : ', id);
  console.log('token user id : ', req.payload.sub);
  if (id != req.payload.sub) {
    console.log('id different modif refusée');
    res.sendStatus(403);
  } else {
    const { firstname, lastname, email, city, language, hashedPassword } =
      req.body;

    database
      .query(
        'update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? where id = ?',
        [firstname, lastname, email, city, language, hashedPassword, id]
      )
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.status(404).send('Not Found');
        } else {
          res.sendStatus(204);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error editing the movie');
      });
  }
};

const deleteUsers = (req, res) => {
  console.log('deleteUsers id : ', req.params.id, ' req body : ', req.body);
  const id = parseInt(req.params.id);
  console.log('deleteUsers id : ', id);
  console.log('token user id : ', req.payload.sub);
  if (id != req.payload.sub) {
    console.log('id different modif refusée');
    res.sendStatus(403);
  } else {
    database
      .query('delete from users where id = ?', [id])
      .then(([result]) => {
        if (result.affectedRows === 0) {
          res.status(404).send('Not Found');
        } else {
          res.sendStatus(204);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error deleting the movie');
      });
  }
};

module.exports = {
  getUsers,
  getUsersById,
  postUsers,
  updateUsers,
  deleteUsers,
  getUserByEmailWithPasswordAndPassToNext,
};
