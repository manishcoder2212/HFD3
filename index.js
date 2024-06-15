const click = document.querySelector('.click');
const giftBox = document.querySelector('.gift-box');
const shadow = document.querySelector('.shadow');
const giftContainer = document.querySelector('.gift-container');
const canvas = document.getElementById('c');

let audio = new Audio("audio.mp3");

function playMusic() {
    audio.play();
}

function stopMusic() {
    audio.pause();
    audio.currentTime = 0;
}

click.addEventListener('click', () => {
    if (!click.classList.contains('active')) {
        playMusic();
        click.classList.add('active');
        giftBox.classList.add('active');
        shadow.classList.add('active');
        giftContainer.classList.add('active');
        startAnimation(["HAPPY", "FATHER'S", "DAY", "PAPA!"]);
    } else {
        click.classList.remove('active');
        giftBox.classList.remove('active');
        shadow.classList.remove('active');
        giftContainer.classList.remove('active');
        stopAnimation();
    }
});

function startAnimation(strings) {
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  let hw = w / 2;
  let hh = h / 2;

  const opts = {
    strings: strings,
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,
    cx: w / 2,
    cy: h / 2,
    fireworkPrevPoints: 10,
    fireworkBaseLineWidth: 5,
    fireworkAddedLineWidth: 8,
    fireworkSpawnTime: 200,
    fireworkBaseReachTime: 30,
    fireworkAddedReachTime: 30,
    fireworkCircleBaseSize: 20,
    fireworkCircleAddedSize: 10,
    fireworkCircleBaseTime: 30,
    fireworkCircleAddedTime: 30,
    fireworkCircleFadeBaseTime: 10,
    fireworkCircleFadeAddedTime: 5,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardPrevPoints: 3,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 360,
    balloonSpawnTime: 20,
    balloonBaseInflateTime: 10,
    balloonAddedInflateTime: 10,
    balloonBaseSize: 20,
    balloonAddedSize: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseRadian: -(Math.PI / 2 - 0.5),
    balloonAddedRadian: -1,
  };

  const calc = {
    totalWidth: opts.charSpacing * Math.max(...opts.strings.map(str => str.length))
  };

  const Tau = Math.PI * 2;
  const TauQuarter = Tau / 4;
  let letters = [];

  ctx.font = `${opts.charSize}px Verdana`;

  class Letter {
    constructor(char, x, y) {
        this.char = char;
        this.x = x;
        this.y = y;
        this.dx = -ctx.measureText(char).width / 2;
        this.dy = +opts.charSize / 2;
        this.fireworkDy = this.y - hh;
        const hue = (x / calc.totalWidth) * 360;
        this.color = `hsl(${hue},80%,50%)`;
        this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`;
        this.lightColor = `hsl(${hue},80%,light%)`;
        this.alphaColor = `hsla(${hue},80%,50%,alp)`;
        this.shards = []; // Initialize shards as an empty array
        this.reset();
    }

    reset() {
        this.phase = 'firework';
        this.tick = 0;
        this.spawned = false;
        this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
        this.reachTime = opts.fireworkBaseReachTime + (opts.fireworkAddedReachTime * Math.random()) | 0;
        this.lineWidth = opts.fireworkBaseLineWidth + (opts.fireworkAddedLineWidth * Math.random());
        this.prevPoints = [[0, hh, 0]];
    }

    step() {
        if (this.phase === 'firework') {
            if (!this.spawned) {
                ++this.tick;
                if (this.tick >= this.spawningTime) {
                    this.tick = 0;
                    this.spawned = true;
                }
            } else {
                ++this.tick;
                const linearProportion = this.tick / this.reachTime;
                const armonicProportion = Math.sin(linearProportion * TauQuarter);
                const x = linearProportion * this.x;
                const y = hh + armonicProportion * this.fireworkDy;
                if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
                this.prevPoints.push([x, y, linearProportion * this.lineWidth]);
                const lineWidthProportion = 1 / (this.prevPoints.length - 1);
                for (let i = 1; i < this.prevPoints.length; ++i) {
                    const point = this.prevPoints[i];
                    const point2 = this.prevPoints[i - 1];
                    ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
                    ctx.lineWidth = point[2] * lineWidthProportion * i;
                    ctx.beginPath();
                    ctx.moveTo(point[0], point[1]);
                    ctx.lineTo(point2[0], point2[1]);
                    ctx.stroke();
                }
                if (this.tick >= this.reachTime) {
                    this.phase = 'contemplate';
                    this.circleFinalSize = opts.fireworkCircleBaseSize + (opts.fireworkCircleAddedSize * Math.random());
                    this.circleCompleteTime = opts.fireworkCircleBaseTime + (opts.fireworkCircleAddedTime * Math.random()) | 0;
                    this.circleCreating = true;
                    this.circleFading = false;
                    this.circleFadeTime = opts.fireworkCircleFadeBaseTime + (opts.fireworkCircleFadeAddedTime * Math.random()) | 0;
                    this.tick = 0;
                    this.tick2 = 0;
                    this.shards = [];
                    const shardCount = opts.fireworkBaseShards + (opts.fireworkAddedShards * Math.random()) | 0;
                    const angle = Tau / shardCount;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    let x = 1;
                    let y = 0;
                    for (let i = 0; i < shardCount; ++i) {
                        const x1 = x;
                        x = x * cos - y * sin;
                        y = y * cos + x1 * sin;
                        this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
                    }
                }
            }
        } else if (this.phase === 'contemplate') {
            ++this.tick;
            if (this.circleCreating) {
                ++this.tick2;
                const proportion = this.tick2 / this.circleCompleteTime;
                const armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
                ctx.beginPath();
                ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
                ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
                ctx.fill();
                if (this.tick2 > this.circleCompleteTime) {
                    this.tick2 = 0;
                    this.circleCreating = false;
                    this.circleFading = true;
                }
            } else if (this.circleFading) {
                ctx.fillStyle = this.lightColor.replace('light', 70);
                ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                ++this.tick2;
                const proportion = this.tick2 / this.circleFadeTime;
                const armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
                ctx.beginPath();
                ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
                ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
                ctx.fill();
                if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
            } else {              
                ctx.fillStyle = this.lightColor.replace('light', 70);
                ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                let allShardsGone = true;
                this.shards.forEach(shard => {
                    shard.step();
                    if (shard.tick < shard.life) {
                        allShardsGone = false;
                    }
                });
                if (allShardsGone) {
                    const index = letters.indexOf(this);
                    if (index !== -1) letters.splice(index, 1);
                }
            }
        }
    }
}

class Shard {
    constructor(x, y, vx, vy, color) {
        const vel = opts.fireworkShardBaseVel + (opts.fireworkShardAddedVel * Math.random());
        this.vx = vx * vel;
        this.vy = vy * vel;
        this.x = x;
        this.y = y;
        this.prevPoints = [[x, y]];
        this.color = color;
        this.life = opts.fireworkShardBaseTime + (opts.fireworkShardAddedTime * Math.random()) | 0;
        this.tick = 0;
    }

    step() {
        ++this.tick;
        const proportion = this.tick / this.life;
        const armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
        ctx.beginPath();
        ctx.fillStyle = this.color.replace('alp', 1 - armonic);
        ctx.arc(this.x, this.y, armonic * opts.fireworkShardBaseSize, 0, Tau);
        ctx.fill();
        this.x += this.vx;
        this.y += this.vy;
        this.vy += opts.gravity;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.prevPoints.push([this.x, this.y]);
        if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();
        for (let k = 1; k < this.prevPoints.length; ++k) {
            const point = this.prevPoints[k];
            const point2 = this.prevPoints[k - 1];
            ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
            ctx.lineWidth = k / 2;
            ctx.beginPath();
            ctx.moveTo(point[0], point[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();
        }
        if (this.tick >= this.life) {
            const index = letters.findIndex(letter => letter.shards && letter.shards.includes(this));
            if (index !== -1 && letters[index].shards) {
                letters[index].shards.splice(letters[index].shards.indexOf(this), 1);
            }
        }
    }
}




  function animate() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    letters.forEach(letter => letter.step());
    requestAnimationFrame(animate);
  }

  function createLetters() {
    letters = [];
    let y = hh - opts.strings.length * opts.lineHeight / 2;
    for (let i = 0; i < opts.strings.length; ++i) {
      const str = opts.strings[i];
      let x = (w - str.length * opts.charSpacing) / 2;
      for (let j = 0; j < str.length; ++j) {
        letters.push(new Letter(str[j], x, y));
        x += opts.charSpacing;
      }
      y += opts.lineHeight;
    }
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    hw = w / 2;
    hh = h / 2;
    createLetters();
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
}

function stopAnimation() {
  window.removeEventListener('resize', resize);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
