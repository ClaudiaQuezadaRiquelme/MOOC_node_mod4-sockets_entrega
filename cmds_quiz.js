const Score = require("./cmds_score.js");
const {User, Quiz} = require("./model.js").models;

// Show all quizzes in DB including <id> and <author>
exports.list = async (rl) =>  {

  let quizzes = await Quiz.findAll(
    { include: [{
        model: User,
        as: 'author'
      }]
    }
  );
  quizzes.forEach( 
    q => rl.log(`  "${q.question}" (by ${q.author.name}, id=${q.id})`)
  );
}

// Create quiz with <question> and <answer> in the DB
exports.create = async (rl) => {

  let name = await rl.questionP("Enter user");
    let user = await User.findOne({where: {name}});
    if (!user) throw new Error(`User ('${name}') doesn't exist!`);

    let question = await rl.questionP("Enter question");
    if (!question) throw new Error("Response can't be empty!");

    let answer = await rl.questionP("Enter answer");
    if (!answer) throw new Error("Response can't be empty!");

    await Quiz.create( 
      { question,
        answer, 
        authorId: user.id
      }
    );
    rl.log(`   User ${name} creates quiz: ${question} -> ${answer}`);
}

// Test (play) quiz identified by <id>
exports.test = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let quiz = await Quiz.findByPk(Number(id));
  if (!quiz) throw new Error(`  Quiz '${id}' is not in DB`);

  let answered = await rl.questionP(quiz.question);

  if (answered.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
    rl.log(`  The answer "${answered}" is right!`);
  } else {
    rl.log(`  The answer "${answered}" is wrong!`);
  }
}

// Update quiz (identified by <id>) in the DB
exports.update = async (rl) => {

  let id = await rl.questionP("Enter quizId");
  let quiz = await Quiz.findByPk(Number(id));

  let question = await rl.questionP(`Enter question (${quiz.question})`);
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP(`Enter answer (${quiz.answer})`);
  if (!answer) throw new Error("Response can't be empty!");

  quiz.question = question;
  quiz.answer = answer;
  await quiz.save({fields: ["question", "answer"]});

  rl.log(`  Quiz ${id} updated to: ${question} -> ${answer}`);
}

// Delete quiz & favourites (with relation: onDelete: 'cascade')
exports.delete = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let n = await Quiz.destroy({where: {id}});
  
  if (n===0) throw new Error(`  ${id} not in DB`);
  rl.log(`  ${id} deleted from DB`);
}

// los quizzes almacenados en el sistema (en concreto el campo question de cada quiz) van mostrándose (usando la función rl.questionP) de manera aleatoria y consecutiva para tratar de contestarlos.
exports.play = async (rl) => {
  let quizzes = await Quiz.findAll(); // obtener todos id de los quizes
  let idArr = [];
  quizzes.forEach( q => idArr.push(q.id) ); // guardamos los ID en un array que vamos a desordenar
  idArr = idArr.sort( () => { return Math.random() - 0.5 }); // ordena los id al azar
  
  let score = 0; // almacenamos puntaje

  // recorremos la lista de id desordenada para mostrar las preguntas al azar
  for (const id of idArr) { // foreach doesn´t work with async/await 
    let quiz = await Quiz.findByPk(Number(id));
    let correctAnswer = quiz.answer.toLowerCase().trim();
    let enteredAnswer = await rl.questionP(quiz.question);
    if (enteredAnswer.toLowerCase().trim() === correctAnswer) {
      rl.log(`The answer "${enteredAnswer}" is right!`);
      score += 1; // puntaje
    } else { 
      rl.log(`The answer "${enteredAnswer}" is wrong!`);
      break; // si se contesta incorrectamente, el juego termina. No se muestran más quizzes
    }
  }
  // mostrar score cuando se hayan terminado los quizzes
  rl.log(`Score: ${score}`);

  // solicitar nombre de usuario para guardar su puntuación
  const userName = await rl.questionP("Enter your name to store your score");

  // guardar score en la base de datos
  await Score.store(rl, userName, score);
  
}