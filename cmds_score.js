const {User, Quiz, Score} = require("./model.js").models;

exports.store = async (rl, userName, score ) => {
    // Almacenar la puntuación asociada a un usuario en la tabla Scores de la base de datos.
    // En caso de que el usuario introducido no exista,
    //   se creará un nuevo usuario con el nombre introducido y edad 0.

    // console.log(`Score store => userName: ${userName}, score: ${score}`)

    // Si el tipo de userName no es valido, cancelar la consulta
    if (typeof userName !== 'string') {
        throw new Error("User name type invalid!");
        }

    let user = await User.findOne({ where: { name: userName } });

    if (!user) { // si el usuario no se encuentra, crearlo
        user = await User.create( 
            { name: userName, age: 0 } // nombre introducido y edad 0.
        );
    }

    const storeScore = await Score.create( // crear nuevo score
        { wins: score, userId: user.id }
    );
}

exports.list = async (rl) => {
    let scores = await Score.findAll(
        { include: [{
            model: User,
            as: 'gamer'
          }]
        }
    );
    // score format:
    // Peter|3|Tue, 18 Feb 2020 14:20:27 GMT
    scores.forEach( 
        s => rl.log(`  ${s.gamer.name}|${s.wins}|${s.createdAt.toUTCString()}`)
    );
}