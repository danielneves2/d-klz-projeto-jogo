// Captura todos os botões de música
const musicButtons = document.querySelectorAll(".music-btn");

musicButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const musicId = e.target.dataset.music; // Pega o ID da música
    // Redireciona para a página do jogo com o ID da música como parâmetro na URL
    window.location.href = `game.html?music=${musicId}`;
  });
});
