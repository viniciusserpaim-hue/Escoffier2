import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/* =========================================================
   DETECÇÃO MOBILE E VARIÁVEIS DO JOYSTICK
   ========================================================= */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
let joystickActive = false;
let joystickVector = { x: 0, y: 0 };
let touchStartX = 0, touchStartY = 0;

/* =========================================================
   CONTEÚDO HISTÓRICO
   ========================================================= */
const EXHIBITS = {
  welcome: {
    room: "ENTRADA · WELCOME",
    title: "Bem-vindo ao Museu Escoffier",
    pages: [
      { title: "AUGUSTE ESCOFFIER", date: "1846 — 1935", body: ["Este museu apresenta a trajetória de Auguste Escoffier, um dos chefs franceses mais influentes da história da gastronomia.", "Ele nasceu em 1846, na França, e viveu até 1935. Durante esse período, participou da transformação das cozinhas profissionais.", "Caminhe pela rotunda e interaja com as exposições."], note: "Use W A S D para caminhar, o mouse para olhar e E para interagir.", image: "/assets/images/escoffier-portrait.jpg" },
      { title: "COMO EXPLORAR", date: "MUSEU INTERATIVO", body: ["Aproxime-se de uma mesa iluminada. Quando o nome da exposição aparecer, pressione E.", "Pressione H para liberar ou travar o mouse. Pressione ESC para abrir o menu de pausa."], note: "O objetivo é aprender de forma visual e organizada." },
      { title: "O REI DOS COZINHEIROS", date: "UM TÍTULO HISTÓRICO", body: ["Escoffier ficou conhecido como 'o rei dos cozinheiros e o cozinheiro dos reis'.", "Este título reflete sua posição única: ele cozinhou para monarcas, presidentes e celebridades.", "Sua influência foi tão grande que ele se tornou uma das primeiras 'celebridades' da gastronomia mundial."], note: "O título foi cunhado pela imprensa francesa no início do século XX.", image: "/assets/images/escoffier-portrait.jpg" }
    ]
  },
  s1: { room: "SALA 01 · THE BEGINNING", title: "O Começo", pages: [
    { title: "O COMEÇO", date: "28 DE OUTUBRO DE 1846", body: ["Auguste Escoffier nasceu em Villeneuve-Loubet, uma pequena localidade no sul da França, em 28 de outubro de 1846.", "A região fazia parte de uma França marcada por tradições culinárias locais.", "Curiosamente, seu primeiro sonho não era a culinária, mas sim a escultura."], note: "Villeneuve-Loubet fica próxima de Nice.", image: "/assets/images/escoffier-jovem.jpg" },
    { title: "APRENDIZ EM NICE", date: "1859", body: ["Aos 13 anos, Escoffier começou a trabalhar como aprendiz no restaurante de seu tio, em Nice.", "Esse foi seu primeiro contato profissional com uma cozinha de restaurante.", "O ambiente era duro, mas o jovem Escoffier rapidamente se destacou."], note: "O aprendizado prático era comum no século XIX.", image: "/assets/images/nice-cozinha.jpg" },
    { title: "PRIMEIROS PASSOS", type: "map", date: "1846 — 1859", nodes: ["Nascimento na França", "Infância no sul", "Sonho de ser escultor", "Aprendiz em Nice", "Fundamentos da cozinha"], body: ["A formação de Escoffier começou cedo. A experiência em Nice foi o ponto de partida."] },
    { title: "A INFLUÊNCIA DA AVÓ", date: "INFÂNCIA", body: ["Antes de entrar na cozinha profissional, Escoffier aprendeu muito observando sua avó cozinhar.", "Foi ela quem despertou nele o gosto pelos aromas e texturas.", "Essa influência familiar foi fundamental para sua filosofia culinária."], note: "A culinária do sul da França era marcada por azeite e ervas." }
  ]},
  s2: { room: "SALA 02 · THE FIRST KITCHEN", title: "A Primeira Cozinha", pages: [
    { title: "PARIS E O PETIT MOULIN ROUGE", date: "DÉCADA DE 1860", body: ["Escoffier seguiu para Paris, centro da gastronomia europeia.", "Trabalhou no Le Petit Moulin Rouge.", "A cozinha parisiense era exigente: muitos pedidos, equipes grandes e necessidade de coordenação."], note: "Paris era um dos principais centros gastronômicos.", image: "/assets/images/paris-seculo-xix.jpg" },
    { title: "A DISCIPLINA NA COZINHA", date: "APRENDIZADO PROFISSIONAL", body: ["Nas cozinhas, cada pessoa tinha uma função. O trabalho precisava ser rápido e repetível.", "Escoffier aprendeu a trabalhar em ritmo intenso.", "Essa experiência ajudaria na organização de grandes equipes."], note: "A divisão de tarefas é central nas cozinhas modernas." },
    { title: "FORMAÇÃO DE UM CHEF", type: "map", date: "DÉCADA DE 1860", nodes: ["Chegada a Paris", "Le Petit Moulin Rouge", "Ritmo intenso", "Observação", "Experiência"], body: ["Cada etapa acrescentava novos conhecimentos a Escoffier."] },
    { title: "A REVOLUÇÃO DO MENU", date: "DÉCADA DE 1860", body: ["Escoffier simplificou os menus, que antes tinham dezenas de pratos.", "Ele defendia refeições bem executadas com poucas opções.", "Essa visão consolidou o formato moderno de menu."], note: "Antes, banquetes tinham mais de 20 pratos." }
  ]},
  s3: { room: "SALA 03 · WAR AND EXPERIENCE", title: "Guerra e Experiência", pages: [
    { title: "A GUERRA FRANCO-PRUSSIANA", date: "1870 — 1871", body: ["Escoffier serviu como cozinheiro militar.", "Enfrentou o desafio de alimentar muitas pessoas com recursos limitados.", "Esse período é lembrado como parte importante de sua formação."], note: "A Guerra ocorreu entre 1870 e 1871.", image: "/assets/images/guerra-franco-prussiana.jpg" },
    { title: "ORGANIZAÇÃO E ALIMENTAÇÃO", date: "CONTEXTO MILITAR", body: ["O trabalho militar exigia planejamento e coordenação.", "Essa vivência contribuiu para sua visão sobre grandes cozinhas.", "Mais tarde, aplicaria essas ideias em grandes hotéis."], note: "A logística na cozinha foi reforçada aqui.", image: "/assets/images/cozinha-militar.jpg" },
    { title: "APRENDIZADOS DA GUERRA", type: "map", date: "1870 — 1871", nodes: ["Cozinha militar", "Recursos limitados", "Grande escala", "Planejamento", "Disciplina"], body: ["A guerra ofereceu lições sobre organização que marcaram sua trajetória."] },
    { title: "A DISCIPLINA MILITAR NA COZINHA", date: "PÓS-GUERRA", body: ["Escoffier trouxe a disciplina do exército para a cozinha.", "Ele proibiu gritos, bebidas e desordem.", "Essas regras criaram um ambiente de trabalho profissional."], note: "A cozinha moderna deve muito a essa organização." }
  ]},
  s4: { room: "SALA 04 · THE SAVOY REVOLUTION", title: "A Revolução do Savoy", pages: [
    { title: "ESCOFFIER E CÉSAR RITZ", date: "1890", body: ["Escoffier trabalhou no Hotel Savoy, em Londres, ao lado de César Ritz.", "Ritz cuidava da administração; Escoffier comandava a cozinha.", "A combinação entre hospitalidade e alta gastronomia definiu um novo padrão de luxo."], note: "César Ritz foi uma figura central na hotelaria.", image: "/assets/images/savoy-hotel.jpg" },
    { title: "A BRIGADA DE COZINHA", date: "ORGANIZAÇÃO", body: ["Escoffier sistematizou a divisão de funções.", "Cada setor tinha responsabilidades específicas.", "Esse modelo ficou conhecido como sistema de brigada."], note: "A brigada organizava funções como saucier e pâtissier.", image: "/assets/images/brigade-kitchen.jpg" },
    { title: "A HIERARQUIA", type: "map", date: "SISTEMA DE BRIGADA", nodes: ["Chefe de cozinha", "Sous-chef", "Chefes de partida", "Saucier", "Pâtissier", "Commis"], body: ["A equipe grande trabalhava de forma coordenada, reduzindo atrasos."], image: "/assets/images/brigada-ilustracao.jpg" },
    { title: "O NASCIMENTO DO PALACE", date: "FIM DO SÉCULO XIX", body: ["A parceria entre Ritz e Escoffier deu origem ao conceito de 'palace'.", "O Savoy, o Ritz Paris e o Carlton London tornaram-se referências.", "Essa fusão permanece até hoje."], note: "O termo 'ritzy' deriva de César Ritz." }
  ]},
  s5: { room: "SALA 05 · THE CULINARY LEGACY", title: "O Legado Culinário", pages: [
    { title: "LE GUIDE CULINAIRE", date: "1903", body: ["Escoffier publicou Le Guide Culinaire.", "A obra reuniu receitas, técnicas e organização.", "Escrita com a colaboração de outros cozinheiros."], note: "Uma das obras mais importantes da gastronomia.", image: "/assets/images/le-guide-culinaire.jpg" },
    { title: "UMA OBRA DE REFERÊNCIA", date: "SÉCULO XX", body: ["O livro organizou a cozinha francesa de forma sistemática.", "Documentava métodos, bases e preparos.", "Tornou-se referência para gerações."], note: "Ajudou a padronizar técnicas.", image: "/assets/images/guide-culinaire-capa.jpg" },
    { title: "OS ÚLTIMOS ANOS", date: "1935", body: ["Escoffier faleceu em 12 de fevereiro de 1935, em Monte Carlo.", "Seu trabalho influenciou gerações de chefs.", "Ele é lembrado como uma figura central da gastronomia."], note: "Seu legado inclui técnicas e obras escritas.", image: "/assets/images/escoffier-idoso.jpg" },
    { title: "UM HUMANISTA", date: "ALÉM DA COZINHA", body: ["Escoffier foi tocado pelo desperdício de alimentos.", "Ele organizou a redistribuição de excedentes para os necessitados.", "Seu legado vai além da gastronomia."], note: "Seu ativismo humanitário é pouco conhecido." }
  ]},
  s6: { room: "SALA 06 · ICONIC DISHES", title: "Pratos Icônicos", pages: [
    { title: "PÊCHE MELBA", date: "DÉCADA DE 1890", body: ["Criado em homenagem à cantora Nellie Melba.", "Combina pêssego, sorvete de baunilha e calda de framboesa.", "Tornou-se um símbolo da alta gastronomia."], note: "Nellie Melba era uma cantora famosa.", image: "/assets/images/peche-melba.jpg" },
    { title: "POIRE BELLE-HÉLÈNE", date: "SÉCULO XIX", body: ["Pera cozida com sorvete e chocolate quente.", "Outra criação doce que atravessou gerações.", "Homenagem à opereta 'La Belle Hélène'."], note: "Referência a Jacques Offenbach.", image: "/assets/images/poire-belle-helene.jpg" },
    { title: "CRÊPE SUZETTE", date: "LENDÁRIO", body: ["Panqueca flambada com licor de laranja.", "Atribuída a Escoffier, fez sucesso nos grandes hotéis.", "O príncipe de Gales sugeriu o nome."], note: "A criação exata é disputada.", image: "/assets/images/crepe-suzette.jpg" },
    { title: "MARKETING PESSOAL", date: "CURIOSIDADE", body: ["Escoffier tinha um senso de marketing à frente do tempo.", "Dedicar criações a celebridades garantia publicidade.", "Suas sobremesas eram homenagens."], note: "Isso construiu sua imagem pública." }
  ]},
  s7: { room: "SALA 07 · RESTAURANTS & PARTNERSHIPS", title: "Restaurantes e Parcerias", pages: [
    { title: "LE PETIT MOULIN ROUGE", date: "DÉCADA DE 1860", body: ["Escoffier trabalhou no Le Petit Moulin Rouge.", "Aprimorou suas habilidades em um ambiente de alta demanda."], note: "Restaurante badalado em Paris." },
    { title: "HOTEL SAVOY & CÉSAR RITZ", date: "1890 — 1897", body: ["No Hotel Savoy, Escoffier e César Ritz formaram uma dupla lendária.", "Ritz cuidava da hospitalidade e Escoffier da gastronomia."], note: "Marco na hotelaria moderna.", image: "/assets/images/savoy-hotel.jpg" },
    { title: "RITZ PARIS & CARLTON", date: "FIM DO SÉCULO XIX", body: ["Trabalharam no Ritz Hotel em Paris e no Carlton em Londres.", "Tornaram-se referências em luxo."], note: "O Ritz Paris foi inaugurado em 1898.", image: "/assets/images/ritz-paris.jpg" },
    { title: "O FIM DA PARCERIA", date: "INÍCIO DO SÉCULO XX", body: ["A parceria terminou com demissões no Savoy.", "Mas logo se reergueram no Ritz e Carlton.", "Consolidaram seu legado."], note: "Revolucionaram a indústria hoteleira." }
  ]},
  final: { room: "FINAL · THE LEGACY", title: "A Linha do Tempo", pages: [
    { title: "LINHA DO TEMPO", type: "timeline", date: "1846 — 1935", events: [{ year: "1846", text: "Nascimento em Villeneuve-Loubet." }, { year: "1859", text: "Aprendiz em Nice." }, { year: "1870", text: "Cozinheiro militar." }, { year: "1890", text: "Hotel Savoy com César Ritz." }, { year: "1903", text: "Publica Le Guide Culinaire." }, { year: "1935", text: "Falece em Monte Carlo." }], body: ["A trajetória de Escoffier atravessa momentos decisivos."] },
    { title: "CONCLUSÃO", date: "O LEGADO", body: ["Escoffier transformou a cozinha em um sistema organizado.", "Sua influência está na divisão de tarefas e documentação."], note: "Obrigado por visitar o Museu Escoffier." }
  ]}
};

/* =========================================================
   CONFIGURAÇÃO E ESTADO GLOBAL
   ========================================================= */
const ROOM_RADIUS = 16;
const ROOM_HEIGHT = 9; // Teto mais alto para visual clássico
const EXHIBIT_RADIUS = 7;
const WALK_SPEED = 3.4;
const RUN_SPEED = 6.0;
const PLAYER_RADIUS = 0.35;
const EYE_HEIGHT = 1.65;

const EXHIBIT_ANGLES = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
const EXHIBIT_IDS = ["welcome", "s1", "s2", "s3", "s4", "s5", "s6", "s7"];

let scene, camera, renderer, controls, clock, composer, dustParticles, fireflies;
let M = {};
const colliders = [];
const interactiveMeshes = [];
const animatedExhibits = [];
const keys = {};
const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);

let started = false;
let isPresenting = false;
let currentExhibit = null;
let currentPage = 0;
let currentInteractable = null;
let bobTime = 0;
let stepTimer = 0;
let interactKey = "KeyE";
let pauseKey = "KeyH";

/* =========================================================
   UI
   ========================================================= */
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const pauseMenu = document.getElementById("pauseMenu");
const continueButton = document.getElementById("continueButton");
const restartButton = document.getElementById("restartButton");
const interactPrompt = document.getElementById("interactPrompt");
const interactName = document.getElementById("interactName");
const bookOverlay = document.getElementById("bookOverlay");
const bookPage = document.getElementById("bookPage");
const pageIndicator = document.getElementById("pageIndicator");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const closeBookButton = document.getElementById("closeBook");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const settingsHud = document.getElementById("settingsHud");
const hudToggle = document.getElementById("hudToggle");
const hudClose = document.getElementById("hudClose");
const hudVolume = document.getElementById("hudVolume");
const hudQuality = document.getElementById("hudQuality");
const hudShadows = document.getElementById("hudShadows");
const hudKeyInteract = document.getElementById("hudKeyInteract");
const hudKeyPause = document.getElementById("hudKeyPause");

/* =========================================================
   ÁUDIO
   ========================================================= */
class AudioManager {
  constructor() { this.ctx = null; this.master = null; this.volume = 0.6; this.buffers = {}; this.ambientSource = null; }
  async loadSound(name, url) {
    try {
      const response = await fetch(url); if (!response.ok) throw new Error("Not found");
      const arrayBuffer = await response.arrayBuffer();
      if (!this.ctx) this.setupContext();
      const buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers[name] = buffer;
    } catch (e) { console.log(`Áudio ${name} não encontrado (usando sintetizado).`); }
  }
  setupContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx.destination);
  }
  async init() {
    await this.loadSound("ambient", "/assets/audio/ambient-library.mp3");
    await this.loadSound("step", "/assets/audio/step-wood.mp3");
    await this.loadSound("click", "/assets/audio/ui-click.mp3");
    await this.loadSound("page", "/assets/audio/page-turn.mp3");
    await this.loadSound("open", "/assets/audio/book-open.mp3");
    await this.loadSound("close", "/assets/audio/book-close.mp3");
  }
  start() {
    if (!this.ctx) this.setupContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.buffers["ambient"] && !this.ambientSource) {
      this.ambientSource = this.ctx.createBufferSource(); this.ambientSource.buffer = this.buffers["ambient"];
      this.ambientSource.loop = true; this.ambientSource.connect(this.master); this.ambientSource.start();
    }
  }
  setVolume(value) { this.volume = Math.max(0, Math.min(1, value)); if (this.master) this.master.gain.value = this.volume; }
  playSound(name) {
    if (this.buffers[name] && this.ctx) {
      const source = this.ctx.createBufferSource(); source.buffer = this.buffers[name]; source.connect(this.master); source.start(); return true;
    } return false;
  }
  tone(freq, duration, type = "sine", gain = 0.04, slide = 1) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator(); const g = this.ctx.createGain(); const now = this.ctx.currentTime;
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    if (slide !== 1) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), now + duration);
    g.gain.setValueAtTime(gain, now); g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(g); g.connect(this.master); osc.start(now); osc.stop(now + duration);
  }
  click() { if (!this.playSound("click")) this.tone(520, 0.08, "triangle", 0.035, 0.72); }
  openBook() { if (!this.playSound("open")) { this.tone(210, 0.5, "sine", 0.035, 1.5); setTimeout(() => this.tone(340, 0.4, "sine", 0.025, 1.2), 80); } }
  page() { if (!this.playSound("page")) this.tone(720, 0.07, "triangle", 0.025, 0.5); }
  step() { if (!this.playSound("step")) this.tone(90 + Math.random() * 35, 0.055, "triangle", 0.016, 0.75); }
  closeBookSound() { if (!this.playSound("close")) this.tone(300, 0.15, "triangle", 0.02, 0.6); }
}
const audio = new AudioManager();
audio.init();

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
init();

function init() {
  scene = new THREE.Scene();
  // Fundo claro e clássico
  scene.background = new THREE.Color(0xf4f1ea); 
  scene.fog = new THREE.FogExp2(0xf4f1ea, 0.015); 

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 200);
  camera.position.set(0, EYE_HEIGHT, 10);
  camera.lookAt(0, EYE_HEIGHT, 0);
  camera.rotation.order = 'YXZ';

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.getElementById("app").appendChild(renderer.domElement);

  // Post-Processing (Bloom) - Mais suave para ambiente claro
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.4, 0.85);
  bloomPass.threshold = 1.0; 
  bloomPass.strength = 0.4;
  bloomPass.radius = 0.2;

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(camera);

  buildRotunda();
  addEasterEgg();
  buildParticles();
  setupEvents();

  clock = new THREE.Clock();
  animate();
}

/* =========================================================
   FUNÇÕES AUXILIARES E TEXTURAS
   ========================================================= */
function addCollider(minX, maxX, minZ, maxZ) { 
  colliders.push({ minX, maxX, minZ, maxZ }); 
}

function addBox(w, h, d, material, x, y, z, rotY = 0, addCol = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z); 
  mesh.rotation.y = rotY;
  mesh.castShadow = true; 
  mesh.receiveShadow = true; 
  scene.add(mesh);
  
  if (addCol) {
    const halfW = (Math.abs(Math.cos(rotY)) * w + Math.abs(Math.sin(rotY)) * d) / 2;
    const halfD = (Math.abs(Math.sin(rotY)) * w + Math.abs(Math.cos(rotY)) * d) / 2;
    addCollider(x - halfW, x + halfW, z - halfD, z + halfD);
  }
  return mesh;
}

function makeCanvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function createTextures() {
  // Chão de Mármore Branco com rabiscos finos
  const floorColor = makeCanvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#f9f9f9"; ctx.fillRect(0, 0, w, h);
    
    // Veios suaves de mármore
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = `rgba(180, 180, 180, ${0.1 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath(); ctx.moveTo(0, Math.random() * h);
      ctx.bezierCurveTo(w * 0.3, Math.random() * h, w * 0.7, Math.random() * h, w, Math.random() * h); ctx.stroke();
    }
    
    // Rabiscos de arquitetura (grid sutil e desenhos)
    ctx.strokeStyle = "rgba(50, 50, 50, 0.05)"; ctx.lineWidth = 1;
    for(let y=0; y<h; y+=128) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    for(let x=0; x<w; x+=128) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    
    // Desenhos de compasso/rabisco
    ctx.strokeStyle = "rgba(60, 60, 60, 0.08)";
    ctx.beginPath(); ctx.arc(w/2, h/2, 300, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w/2, h/2, 150, 0, Math.PI*2); ctx.stroke();
  }, 4, 4);

  // Parede Clássica (Estuque claro com rabiscos de arcos)
  const wallColor = makeCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f0ebe1"; ctx.fillRect(0, 0, w, h);
    
    // Textura sutil de papel/pedra
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgba(150, 140, 130, ${0.02 + Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    
    // Rabisco de arco clássico
    ctx.strokeStyle = "rgba(100, 90, 80, 0.2)"; ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, w-80, h-80);
    ctx.beginPath(); ctx.arc(w/2, h-40, w/2 - 40, Math.PI, 0); ctx.stroke();
  }, 6, 2);

  // Textura de Rabisco para Objetos (Doodle)
  const sketchTexture = makeCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f5f0e6"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(30, 30, 30, 0.4)"; ctx.lineWidth = 2;
    
    // Rabiscos aleatórios cruzados (Hatching)
    for(let i=0; i<80; i++) {
      ctx.beginPath();
      let x = Math.random() * w;
      let y = Math.random() * h;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random()*80-40), y + (Math.random()*80-40));
      ctx.stroke();
    }
  });

  return { floorColor, wallColor, sketchTexture };
}

/* =========================================================
   CONSTRUÇÃO DA ROTUNDA CLÁSSICA
   ========================================================= */
function buildRotunda() {
  const tex = createTextures();

  M = {
    floor: new THREE.MeshStandardMaterial({ map: tex.floorColor, roughness: 0.3, metalness: 0.1 }),
    wall: new THREE.MeshStandardMaterial({ map: tex.wallColor, roughness: 0.9, metalness: 0.0 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 }), // Estátuas e pedestais
    wood: new THREE.MeshStandardMaterial({ color: 0x8b6b4a, roughness: 0.7, metalness: 0.0 }), // Madeira clássica clara
    gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 }), // Ouro para detalhes
    sketch: new THREE.MeshStandardMaterial({ map: tex.sketchTexture, roughness: 0.8 }), // Material de Rabisco
    book: new THREE.MeshStandardMaterial({ color: 0x800000, roughness: 0.6 }), // Vermelho escuro para o livro
    paper: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00aaff, emissiveIntensity: 1.5 })
  };

  // Chão
  const floor = new THREE.Mesh(new THREE.CircleGeometry(ROOM_RADIUS, 64), M.floor);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // Teto
  const ceiling = new THREE.Mesh(new THREE.CircleGeometry(ROOM_RADIUS, 64), M.wall);
  ceiling.rotation.x = Math.PI / 2; ceiling.position.y = ROOM_HEIGHT; ceiling.receiveShadow = true; scene.add(ceiling);

  // Parede
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, ROOM_HEIGHT, 64, 1, true), M.wall);
  wall.position.y = ROOM_HEIGHT / 2; wall.receiveShadow = true; scene.add(wall);

  // Pilares Clássicos (Colunas Gregas)
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const px = Math.cos(angle) * (ROOM_RADIUS - 0.5);
    const pz = Math.sin(angle) * (ROOM_RADIUS - 0.5);
    
    const colGroup = new THREE.Group();
    colGroup.position.set(px, 0, pz);
    colGroup.rotation.y = -angle;

    // Fuste da coluna
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, ROOM_HEIGHT, 16), M.marble);
    shaft.position.y = ROOM_HEIGHT / 2;
    shaft.castShadow = true; shaft.receiveShadow = true;
    colGroup.add(shaft);

    // Capitel
    addBox(1.2, 0.5, 1.2, M.marble, 0, ROOM_HEIGHT - 0.25, 0, 0, colGroup, false);
    addBox(1.0, 0.3, 1.0, M.gold, 0, ROOM_HEIGHT - 0.6, 0, 0, colGroup, false);

    // Base
    addBox(1.2, 0.4, 1.2, M.marble, 0, 0.2, 0, 0, colGroup, false);

    scene.add(colGroup);
  }

  // Estantes de Livros Clássicas e Estátuas
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + (Math.PI / 16); // Entre as colunas
    const sx = Math.cos(angle) * (ROOM_RADIUS - 1.2);
    const sz = Math.sin(angle) * (ROOM_RADIUS - 1.2);
    
    if (i % 2 === 0) {
      buildBookshelf(sx, sz, angle);
    } else {
      addStatue(sx, sz, angle);
    }
  }

  // Áreas de Leitura
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI/8;
    const r = 11;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    addReadingArea(x, z, angle);
  }

  // Exposições
  EXHIBIT_IDS.forEach((id, index) => {
    const data = EXHIBITS[id]; if (!data) return;
    const angle = EXHIBIT_ANGLES[index];
    createExhibit(data, Math.cos(angle) * EXHIBIT_RADIUS, Math.sin(angle) * EXHIBIT_RADIUS);
  });
  createExhibit(EXHIBITS["final"], 0, 0);

  // Balcão central
  const counter = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 1.2, 32), M.marble);
  counter.position.set(0, 0.6, 0); counter.castShadow = true; counter.receiveShadow = true; scene.add(counter);
  
  const counterTop = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 32), M.wood);
  counterTop.position.set(0, 1.25, 0); counterTop.castShadow = true; scene.add(counterTop);

  // ===== ILUMINAÇÃO CLÁSSICA E BRILHANTE =====
  const ambient = new THREE.AmbientLight(0xffffff, 0.8); // Luz ambiente alta
  scene.add(ambient);
  
  const hemi = new THREE.HemisphereLight(0xffffff, 0xdedede, 0.6); 
  scene.add(hemi);

  // Luz do Sol (Simulando claraboia)
  const sunLight = new THREE.DirectionalLight(0xfffaee, 1.5);
  sunLight.position.set(10, 20, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048); 
  sunLight.shadow.camera.near = 1; sunLight.shadow.camera.far = 60;
  sunLight.shadow.camera.left = -20; sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20; sunLight.shadow.camera.bottom = -20;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Luzes de preenchimento nas paredes
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const lx = Math.cos(angle) * (ROOM_RADIUS - 3);
    const lz = Math.sin(angle) * (ROOM_RADIUS - 3);
    const spot = new THREE.SpotLight(0xfff0dd, 10, 20, Math.PI / 3, 0.5, 1.5);
    spot.position.set(lx, ROOM_HEIGHT - 1, lz);
    spot.target.position.set(lx * 1.2, 0, lz * 1.2);
    spot.castShadow = false;
    scene.add(spot); scene.add(spot.target);
  }
}

/* =========================================================
   MÓVEIS, ESTÁTUAS E OBJETOS CLÁSSICOS
   ========================================================= */
function addStatue(x, z, angle) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = -angle + Math.PI / 2;

  // Pedestal (Mármore)
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 1.2), M.marble);
  base.position.y = 0.75; base.castShadow = true; base.receiveShadow = true;
  group.add(base);
  
  // Detalhe do pedestal
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.4), M.gold);
  trim.position.y = 1.5; group.add(trim);

  // Corpo da estátua (Simulando um busto ou figura clássica)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8), M.marble);
  torso.position.y = 2.1; torso.castShadow = true; group.add(torso);

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), M.marble);
  shoulders.position.y = 2.7; shoulders.scale.set(1, 0.6, 0.8); shoulders.castShadow = true; group.add(shoulders);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), M.marble);
  head.position.y = 3.0; head.castShadow = true; group.add(head);

  scene.add(group);

  // Colisão
  addCollider(x - 0.7, x + 0.7, z - 0.7, z + 0.7);
}

function addReadingArea(x, z, angle) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = -angle + Math.PI/2;

  // Mesa com textura de rabisco
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.0), M.sketch);
  table.position.y = 0.9; table.castShadow = true; table.receiveShadow = true; group.add(table);
  
  // Pernas de mármore
  for(let dx of [-0.8, 0.8]) {
    for(let dz of [-0.4, 0.4]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), M.marble);
      leg.position.set(dx, 0.45, dz); leg.castShadow = true; group.add(leg);
    }
  }

  // Luminária de mesa Clássica (Ouro)
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.4, 16), M.gold);
  lampBase.position.set(0, 1.1, 0); group.add(lampBase);
  
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.3, 16), M.paper);
  lampShade.position.set(0, 1.4, 0); group.add(lampShade);

  // Luz suave da luminária
  const lampLight = new THREE.PointLight(0xffeedd, 1.5, 4, 2);
  lampLight.position.set(0, 1.3, 0); group.add(lampLight);

  // Cadeiras Clássicas
  const chair1 = createChair(); chair1.position.set(-0.5, 0, -0.8); group.add(chair1);
  const chair2 = createChair(); chair2.position.set(0.5, 0, 0.8); chair2.rotation.y = Math.PI; group.add(chair2);

  scene.add(group);
}

function createChair() {
  const chair = new THREE.Group();
  // Assento com rabisco
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), M.sketch);
  seat.position.y = 0.45; seat.castShadow = true; chair.add(seat);
  
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), M.wood);
  back.position.set(0, 0.75, -0.2); back.castShadow = true; chair.add(back);

  for(let dx of [-0.2, 0.2]) {
    for(let dz of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), M.marble);
      leg.position.set(dx, 0.225, dz); leg.castShadow = true; chair.add(leg);
    }
  }
  return chair;
}

function buildBookshelf(x, z, angle) {
  const group = new THREE.Group();
  group.position.set(x, 0, z); group.rotation.y = -angle + Math.PI / 2;

  // Estrutura de Madeira Clara com rabisco
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.0, 2.6), M.wood);
  frame.position.y = 2.5; frame.castShadow = true; frame.receiveShadow = true; group.add(frame);

  // Detalhe do topo (Cornija)
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 2.8), M.marble);
  cornice.position.y = 5.0; group.add(cornice);

  // Prateleiras e Livros (Cores clássicas: vinho, azul escuro, verde)
  for (let y = 0.5; y < 4.8; y += 0.75) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 2.4), M.marble);
    shelf.position.set(-0.1, y, 0); group.add(shelf);

    for (let i = 0; i < 10; i++) {
      const bookW = 0.08 + Math.random() * 0.06;
      const bookH = 0.35 + Math.random() * 0.2;
      const colors = [0x800000, 0x191970, 0x2e8b57, 0x8b4513, 0x4b0082];
      const bookMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random()*colors.length)], roughness: 0.7 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(bookW, bookH, 0.3), bookMat);
      
      book.position.set(0.3, y + 0.04 + bookH/2, -1.1 + i * 0.24);
      book.rotation.z = (Math.random() - 0.5) * 0.1;
      book.castShadow = true; group.add(book);
    }
  }
  scene.add(group);

  const halfW = (Math.abs(Math.cos(angle)) * 1.0 + Math.abs(Math.sin(angle)) * 2.6) / 2;
  const halfD = (Math.abs(Math.sin(angle)) * 1.0 + Math.abs(Math.cos(angle)) * 2.6) / 2;
  addCollider(x - halfW, x + halfW, z - halfD, z + halfD);
}

function createExhibit(data, x, z) {
  const group = new THREE.Group(); group.position.set(x, 0, z);

  // Base de Mármore Clássica
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.0, 16), M.marble);
  base.position.y = 0.5; base.castShadow = true; base.receiveShadow = true; group.add(base);

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 16), M.sketch);
  top.position.y = 1.05; top.castShadow = true; group.add(top);

  // Anel Dourado (Bloom)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 8, 32), M.gold);
  ring.rotation.x = Math.PI / 2; ring.position.y = 1.15; group.add(ring);

  // Livro em exposição
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.42), M.book);
  book.position.y = 1.2; book.castShadow = true; group.add(book);

  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.38), M.paper);
  pages.position.y = 1.24; group.add(pages);

  const label = makeTextSprite(data.title, data.room);
  label.position.y = 2.3; label.scale.set(2.8, 0.7, 1); group.add(label);

  group.traverse((obj) => { if (obj.isMesh) { obj.userData.exhibit = data; interactiveMeshes.push(obj); } });
  group.userData.ring = ring; group.userData.book = book; group.userData.bookBaseY = book.position.y;
  animatedExhibits.push(group);

  scene.add(group);

  const light = new THREE.PointLight(0x00ffff, 2, 5, 2);
  light.position.set(x, 1.5, z); scene.add(light);
  group.userData.light = light; 
}

/* =========================================================
   EASTER EGG
   ========================================================= */
function addEasterEgg() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('/assets/images/Easter-Egg.jpg', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), mat);
    plane.position.set(0, ROOM_HEIGHT - 0.1, 0);
    plane.rotation.x = Math.PI / 2; 
    scene.add(plane);
    
    // Luz suave para o easter egg
    const light = new THREE.PointLight(0xff55aa, 5, 12, 2);
    light.position.set(0, ROOM_HEIGHT - 1, 0);
    scene.add(light);
  });
}

/* =========================================================
   PARTÍCULAS (Poeira Clássica)
   ========================================================= */
function buildParticles() {
  const dCount = 800;
  const dGeom = new THREE.BufferGeometry();
  const dPos = new Float32Array(dCount * 3);
  for (let i = 0; i < dCount; i++) {
    const r = Math.random() * ROOM_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    dPos[i * 3] = Math.cos(theta) * r;
    dPos[i * 3 + 1] = Math.random() * ROOM_HEIGHT;
    dPos[i * 3 + 2] = Math.sin(theta) * r;
  }
  dGeom.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  
  // Poeira branca/dourada
  const dMat = new THREE.PointsMaterial({
    color: 0xfffaee, size: 0.04, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending
  });
  dustParticles = new THREE.Points(dGeom, dMat);
  scene.add(dustParticles);
}

/* =========================================================
   TEXTOS FLUTUANTES
   ========================================================= */
function makeTextSprite(title, subtitle) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fundo estilo pergaminho claro
  ctx.fillStyle = "rgba(255, 250, 235, 0.95)"; ctx.fillRect(24, 28, 976, 200);
  ctx.strokeStyle = "#b89b5e"; ctx.lineWidth = 5; ctx.strokeRect(24, 28, 976, 200);
  ctx.textAlign = "center";
  ctx.fillStyle = "#2b1d14"; ctx.font = "bold 56px Georgia"; ctx.fillText(title, 512, 120);
  ctx.fillStyle = "#5c452a"; ctx.font = "24px Georgia"; ctx.fillText(subtitle, 512, 176);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  return new THREE.Sprite(material);
}

/* =========================================================
   EVENTOS E CONTROLES (Mantidos iguais)
   ========================================================= */
function setupEvents() {
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  controls.addEventListener("lock", () => pauseMenu.classList.add("hidden"));
  controls.addEventListener("unlock", () => {
    for (const key in keys) keys[key] = false;
    if (started && !isPresenting && !isMobile) pauseMenu.classList.remove("hidden");
  });

  startButton.addEventListener("click", () => {
    started = true; startScreen.classList.add("hidden"); audio.start(); audio.click();
    if (!isMobile) controls.lock();
  });
  
  continueButton.addEventListener("click", () => { audio.start(); audio.click(); pauseMenu.classList.add("hidden"); controls.lock(); });
  restartButton.addEventListener("click", () => window.location.reload());

  volumeSlider.addEventListener("input", () => { const val = Number(volumeSlider.value); audio.setVolume(val / 100); volumeValue.textContent = `${val}%`; hudVolume.value = val; });
  hudVolume.addEventListener("input", () => { const val = Number(hudVolume.value); audio.setVolume(val / 100); volumeSlider.value = val; volumeValue.textContent = `${val}%`; });

  prevPageButton.addEventListener("click", () => { if (!currentExhibit) return; if (currentPage > 0) { currentPage--; renderPage("prev"); audio.page(); } });
  nextPageButton.addEventListener("click", () => { if (!currentExhibit) return; if (currentPage < currentExhibit.pages.length - 1) { currentPage++; renderPage("next"); audio.page(); } });
  closeBookButton.addEventListener("click", closeBook);

  renderer.domElement.addEventListener("click", () => { if (started && !isPresenting && !controls.isLocked && !isMobile) controls.lock(); });

  hudToggle.addEventListener("click", () => { settingsHud.classList.toggle("hidden"); if (controls.isLocked) controls.unlock(); });
  hudClose.addEventListener("click", () => { settingsHud.classList.add("hidden"); if (started && !isPresenting && !isMobile) controls.lock(); });
  
  hudQuality.addEventListener("change", () => {
    const q = hudQuality.value;
    if (q === "low") { renderer.setPixelRatio(0.8); renderer.shadowMap.enabled = false; composer.passes[1].enabled = false; }
    else if (q === "medium") { renderer.setPixelRatio(1.0); renderer.shadowMap.enabled = true; composer.passes[1].enabled = true; }
    else { renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.shadowMap.enabled = true; composer.passes[1].enabled = true; }
  });
  hudShadows.addEventListener("change", () => { renderer.shadowMap.enabled = hudShadows.checked; });
  hudKeyInteract.addEventListener("change", () => { const val = hudKeyInteract.value.toUpperCase(); if (val.length === 1) interactKey = `Key${val}`; });
  hudKeyPause.addEventListener("change", () => { const val = hudKeyPause.value.toUpperCase(); if (val.length === 1) pauseKey = `Key${val}`; });

  // ====== LÓGICA MOBILE ======
  if (isMobile) {
    const mobileControls = document.getElementById("mobileControls");
    const mobileInteractBtn = document.getElementById("mobileInteractBtn");
    const joystickBase = document.getElementById("joystickBase");
    const joystickStick = document.getElementById("joystickStick");
    
    mobileControls.classList.remove("hidden");

    joystickBase.addEventListener("touchstart", (e) => { joystickActive = true; updateJoystick(e.touches[0]); });
    joystickBase.addEventListener("touchmove", (e) => { if (joystickActive) { e.preventDefault(); updateJoystick(e.touches[0]); } });
    joystickBase.addEventListener("touchend", () => { joystickActive = false; joystickVector = { x: 0, y: 0 }; joystickStick.style.transform = `translate(-50%, -50%)`; });

    function updateJoystick(touch) {
      const rect = joystickBase.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      const maxDist = rect.width / 2;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance > maxDist) { dx = (dx / distance) * maxDist; dy = (dy / distance) * maxDist; }
      joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      joystickVector.x = dx / maxDist;
      joystickVector.y = dy / maxDist;
    }

    const canvas = renderer.domElement;
    canvas.addEventListener("touchstart", (e) => {
      if (e.target === canvas) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }
    });

    canvas.addEventListener("touchmove", (e) => {
      if (e.target === canvas && !isPresenting) {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;
        const sensitivity = 0.005;
        camera.rotation.y -= deltaX * sensitivity;
        camera.rotation.x -= deltaY * sensitivity;
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
        touchStartX = touchX;
        touchStartY = touchY;
      }
    }, { passive: false });

    mobileInteractBtn.addEventListener("touchstart", (e) => { e.preventDefault(); interact(); });
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  keys[event.code] = true;
  if (event.code === pauseKey) { event.preventDefault(); if (controls.isLocked) controls.unlock(); else if (started && !isPresenting) controls.lock(); return; }
  if (event.code === interactKey) interact();
  if (isPresenting) {
    if (event.code === "Escape") { event.preventDefault(); closeBook(); }
    if (event.code === "ArrowRight" || event.code === "KeyD") { event.preventDefault(); nextPageButton.click(); }
    if (event.code === "ArrowLeft" || event.code === "KeyA") { event.preventDefault(); prevPageButton.click(); }
  }
}
function onKeyUp(event) { keys[event.code] = false; }

/* =========================================================
   INTERAÇÃO E APRESENTAÇÃO
   ========================================================= */
function interact() { 
  if (!currentInteractable || isPresenting) return; 
  if (!isMobile && !controls.isLocked) return; 
  openPresentation(currentInteractable); 
}

function updatePrompt() {
  if (!started || isPresenting || (!controls.isLocked && !isMobile)) { 
    interactPrompt.classList.add("hidden"); 
    currentInteractable = null; 
    return; 
  }
  raycaster.setFromCamera(centerScreen, camera);
  const hits = raycaster.intersectObjects(interactiveMeshes, false);
  if (hits.length > 0 && hits[0].distance < 5.0) {
    const data = hits[0].object.userData.exhibit;
    if (data) { 
      currentInteractable = data; 
      interactName.textContent = data.title; 
      if (!isMobile) interactPrompt.classList.remove("hidden"); 
      return; 
    }
  }
  currentInteractable = null; 
  if (!isMobile) interactPrompt.classList.add("hidden");
}

function openPresentation(data) {
  currentExhibit = data; currentPage = 0; isPresenting = true; 
  if (!isMobile) controls.unlock(); 
  interactPrompt.classList.add("hidden");
  renderPage("next"); bookOverlay.classList.remove("hidden"); requestAnimationFrame(() => bookOverlay.classList.add("open")); audio.openBook();
}

function closeBook() {
  if (!isPresenting) return;
  audio.closeBookSound(); bookOverlay.classList.remove("open"); isPresenting = false;
  if (started && !isMobile) controls.lock();
  setTimeout(() => { bookOverlay.classList.add("hidden"); currentExhibit = null; if (started && !controls.isLocked && !isMobile) pauseMenu.classList.remove("hidden"); }, 360);
}

function renderPage() {
  if (!currentExhibit) return;
  const page = currentExhibit.pages[currentPage];
  let html = `<div class="page-top"><span>${currentExhibit.room}</span><span class="page-date">${page.date || ""}</span></div>`;
  html += `<h2>${page.title}</h2>`;
  if (page.image) html += `<div class="page-image"><img src="${page.image}" alt="${page.title}"></div>`;
  if (page.type === "map") {
    html += `<div class="mind-map"><div class="map-center">${currentExhibit.title.toUpperCase()}</div><div class="map-branches">`;
    page.nodes.forEach((node, index) => html += `<div class="map-node" style="--i:${index}">${node}</div>`); html += `</div></div>`;
  } else if (page.type === "timeline") {
    html += `<div class="timeline">`;
    page.events.forEach((event, index) => html += `<div class="timeline-event" style="--i:${index}"><strong>${event.year}</strong> — ${event.text}</div>`); html += `</div>`;
  }
  if (page.body && page.body.length) { html += `<div class="page-body">`; page.body.forEach((p) => html += `<p>${p}</p>`); html += `</div>`; }
  if (page.note) html += `<div class="note">${page.note}</div>`;
  bookPage.innerHTML = html; bookPage.classList.remove("page-enter"); void bookPage.offsetWidth; bookPage.classList.add("page-enter"); bookPage.scrollTop = 0;
  pageIndicator.textContent = `${currentPage + 1} / ${currentExhibit.pages.length}`;
  prevPageButton.disabled = currentPage === 0; nextPageButton.disabled = currentPage === currentExhibit.pages.length - 1;
}

/* =========================================================
   MOVIMENTO E COLISÃO
   ========================================================= */
function collides(x, z) {
  if (Math.hypot(x, z) > ROOM_RADIUS - PLAYER_RADIUS - 0.5) return true;
  for (const c of colliders) {
    if (x + PLAYER_RADIUS > c.minX && x - PLAYER_RADIUS < c.maxX && z + PLAYER_RADIUS > c.minZ && z - PLAYER_RADIUS < c.maxZ) return true;
  }
  return false;
}

function updatePlayer(delta) {
  const forward = new THREE.Vector3(); camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
  const up = new THREE.Vector3(0, 1, 0); const right = new THREE.Vector3().crossVectors(forward, up).normalize();
  const move = new THREE.Vector3();
  
  if (isMobile) {
    if (joystickVector.y < -0.1) move.add(forward);
    if (joystickVector.y > 0.1) move.sub(forward);
    if (joystickVector.x > 0.1) move.add(right);
    if (joystickVector.x < -0.1) move.sub(right);
  } else {
    if (keys.KeyW) move.add(forward); if (keys.KeyS) move.sub(forward);
    if (keys.KeyD) move.add(right); if (keys.KeyA) move.sub(right);
  }

  if (move.lengthSq() > 0) {
    move.normalize(); 
    const speed = keys.ShiftLeft || keys.ShiftRight ? RUN_SPEED : WALK_SPEED; 
    move.multiplyScalar(speed * delta);
    
    const nextX = camera.position.x + move.x; 
    if (!collides(nextX, camera.position.z)) camera.position.x = nextX;
    
    const nextZ = camera.position.z + move.z; 
    if (!collides(camera.position.x, nextZ)) camera.position.z = nextZ;
    
    bobTime += delta * (keys.ShiftLeft ? 14 : 10); 
    camera.position.y = EYE_HEIGHT + Math.sin(bobTime) * 0.025;
    
    stepTimer += delta; 
    if (stepTimer > (keys.ShiftLeft ? 0.32 : 0.45)) { audio.step(); stepTimer = 0; }
  } else { 
    camera.position.y += (EYE_HEIGHT - camera.position.y) * 0.12; 
  }
}

/* =========================================================
   LOOP DE ANIMAÇÃO
   ========================================================= */
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  if ((controls.isLocked || isMobile) && !isPresenting) updatePlayer(delta);
  updatePrompt();

  if (isMobile) {
    const btn = document.getElementById("mobileInteractBtn");
    if (currentInteractable && !isPresenting && started) btn.classList.remove("hidden");
    else btn.classList.add("hidden");
  }

  animatedExhibits.forEach((group) => {
    if (group.userData.ring) group.userData.ring.rotation.z += delta * 1.5;
    if (group.userData.book) {
      group.userData.book.position.y = group.userData.bookBaseY + Math.sin(elapsed * 2 + group.position.z) * 0.05;
      if (group.userData.light) group.userData.light.intensity = 1.5 + Math.sin(elapsed * 3) * 0.5; // Ajustado para ambiente claro
    }
  });

  if (dustParticles) {
    const pos = dustParticles.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + delta * 0.05;
      if (y > ROOM_HEIGHT) y = 0;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }

  composer.render();
}