document.addEventListener("DOMContentLoaded", () => {
  const lanes = {
    a: document.getElementById("lane-a"),
    s: document.getElementById("lane-s"),
    d: document.getElementById("lane-d"),
    f: document.getElementById("lane-f"),
  };

  const laneKeys = Object.keys(lanes);
  const playArea = document.querySelector(".play-area");
  const gameMusic = document.getElementById("gameMusic");
  const countdownDisplay = document.getElementById("countdown");
  const scoreDisplay = document.getElementById("score");
  const failScoreDisplay = document.getElementById("fail-score"); // Exibe os erros na tela
  let score = 0;
  let failScore = 0; // Contador de falhas
  const maxFails = 50; // Limite de falhas
  let gameInterval;
  let noteMap = [];
  let gameOver = false;
  Object.keys(lanes).forEach((key) => {
    const lane = lanes[key];

    lane.addEventListener("touchstart", () => {
      if (gameOver) return;
      lane.classList.add("active");

      // Simule um evento de tecla pressionada
      const notes = document.querySelectorAll(".note");
      let hit = false;

      notes.forEach((note) => {
        const noteLeft = parseInt(note.style.left);
        const noteTop = parseInt(note.style.top);

        const laneIndex = laneKeys.indexOf(key);
        const laneWidth = playArea.clientWidth / laneKeys.length;
        const laneCenter = laneWidth * laneIndex + laneWidth / 2;

        if (
          Math.abs(noteLeft - laneCenter + playArea.clientWidth * 0.05) <=
            laneWidth / 2 &&
          noteTop > playArea.clientHeight - 100 &&
          noteTop < playArea.clientHeight - 50
        ) {
          updateScore(10);
          playArea.removeChild(note);
          hit = true;
        }
      });

      setLaneFeedback(key, hit);
    });

    lane.addEventListener("touchend", () => {
      lane.classList.remove("active", "success", "missed");
    });
  });

  // Atualizar pontuação na tela
  function updateScore(points) {
    if (gameOver) return;
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
  }

  // Atualizar falhas na tela
  function updateFailScore() {
    if (gameOver) return;
    failScore += 1;
    failScoreDisplay.textContent = `Fails: ${failScore}`;
    if (failScore >= maxFails) {
      endGame(false); // Finaliza o jogo ao atingir o limite de falhas
    }
  }

  // Exibir falha ou sucesso visualmente
  function setLaneFeedback(key, isSuccess) {
    const laneElement = lanes[key];
    if (isSuccess) {
      laneElement.classList.add("success");
    } else {
      laneElement.classList.add("missed");
      updateFailScore(); // Incrementa o contador de falhas em caso de erro
    }
  }

  // Remover feedback ao soltar a tecla
  document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (lanes[key]) {
      lanes[key].classList.remove("success", "missed", "active");
    }
  });

  // Criar popup de Game Over ou Score Final
  function createPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
      <div class="popup-content">
        <h1>${message}</h1>
        <p>Score Final: ${score}</p>
        <button id="return-menu">Voltar ao Menu</button>
      </div>
    `;

    document.body.appendChild(popup);

    const returnButton = document.getElementById("return-menu");
    returnButton.addEventListener("click", () => {
      window.location.href = "menu.html";
    });
  }

  // Gerar notas dinamicamente com base na duração da música
  function generateNoteMap(duration, interval) {
    const noteMap = [];
    for (let time = 0; time <= duration; time += interval) {
      noteMap.push({
        time: time,
        lane: laneKeys[Math.floor(Math.random() * laneKeys.length)],
      });
    }
    return noteMap;
  }

  // Identificar a música selecionada
  const urlParams = new URLSearchParams(window.location.search);
  const musicId = urlParams.get("music");

  // Caminhos para músicas
  const musicPaths = {
    1: "msc1.mp3",
    2: "msc2.mp3",
    3: "msc3.mp3",
  };

  if (musicPaths[musicId]) {
    gameMusic.src = musicPaths[musicId];
  } else {
    alert("Música inválida! Retornando ao menu.");
    window.location.href = "menu.html";
  }

  // Criar o mapa de notas com base na duração da música
  gameMusic.addEventListener("loadedmetadata", () => {
    const duration = gameMusic.duration;
    noteMap = generateNoteMap(duration, 0.5);

    // Iniciar o cronômetro antes do jogo
    startCountdown(startGame);
  });

  // Criar notas (boxes) baseadas no mapa
  function createNote(laneKey) {
    if (gameOver) return;

    const note = document.createElement("div");
    note.classList.add("note");
    note.style.position = "absolute";
    note.style.width = "10%";
    note.style.height = "40px";
    note.style.backgroundColor = "#0f0";
    note.style.top = "0px";

    const laneIndex = laneKeys.indexOf(laneKey);
    const laneWidth = playArea.clientWidth / laneKeys.length;
    note.style.left = `${
      laneWidth * laneIndex + laneWidth / 2 - playArea.clientWidth * 0.05
    }px`;

    playArea.appendChild(note);

    const interval = setInterval(() => {
      if (gameOver) {
        clearInterval(interval);
        if (playArea.contains(note)) playArea.removeChild(note);
        return;
      }

      const top = parseInt(note.style.top);
      if (top >= playArea.clientHeight - 50) {
        clearInterval(interval);
        if (playArea.contains(note)) {
          playArea.removeChild(note);
          setLaneFeedback(laneKey, false);
        }
      } else {
        note.style.top = `${top + 10}px`;
      }
    }, 30);
  }

  // Monitorar tempo da música e criar notas
  function monitorMusic() {
    if (gameOver) return;
    const currentTime = gameMusic.currentTime;

    noteMap.forEach((note) => {
      if (!note.triggered && currentTime >= note.time) {
        createNote(note.lane);
        note.triggered = true;
      }
    });
  }

  // Detectar teclas e verificar acertos
  document.addEventListener("keydown", (event) => {
    if (gameOver) return;
    const key = event.key.toLowerCase();
    if (lanes[key]) {
      lanes[key].classList.add("active");

      const notes = document.querySelectorAll(".note");
      let hit = false;

      notes.forEach((note) => {
        const noteLeft = parseInt(note.style.left);
        const noteTop = parseInt(note.style.top);

        const laneIndex = laneKeys.indexOf(key);
        const laneWidth = playArea.clientWidth / laneKeys.length;
        const laneCenter = laneWidth * laneIndex + laneWidth / 2;

        if (
          Math.abs(noteLeft - laneCenter + playArea.clientWidth * 0.05) <=
            laneWidth / 2 &&
          noteTop > playArea.clientHeight - 100 &&
          noteTop < playArea.clientHeight - 50
        ) {
          updateScore(10);
          playArea.removeChild(note);
          hit = true;
        }
      });

      setLaneFeedback(key, hit);
    }
  });

  // Finalizar o jogo
  function endGame(isWin) {
    if (gameOver) return;
    gameOver = true;
    clearInterval(gameInterval);
    gameMusic.pause();
    const message = isWin
      ? "Parabéns! Jogo Concluído!"
      : "Game Over! Você ultrapassou o limite de falhas!";
    createPopup(message);
  }

  // Iniciar monitoramento das notas quando a música começar a tocar
  function startGame() {
    gameMusic.play();
    gameInterval = setInterval(monitorMusic, 50);
  }

  // Parar o jogo ao término da música
  gameMusic.addEventListener("ended", () => {
    if (!gameOver) endGame(true);
  });

  // Exibir o cronômetro
  function startCountdown(callback) {
    let countdown = 3;
    countdownDisplay.style.display = "block";
    countdownDisplay.textContent = countdown;

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        countdownDisplay.textContent = countdown;
      } else {
        clearInterval(countdownInterval);
        countdownDisplay.style.display = "none";
        callback();
      }
    }, 1000);
  }
});
