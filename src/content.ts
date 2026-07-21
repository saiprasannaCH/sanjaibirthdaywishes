/** Edit this file to personalize Sanjai's birthday experience. */

/** Public assets must respect Vite base (GitHub Pages lives under /sanjaibirthdaywishes/) */
const asset = (path: string) => {
  const clean = path.replace(/^\//, '');
  const encoded = clean
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${import.meta.env.BASE_URL}${encoded}`;
};

export const photoFrames = [
  {
    src: asset('photos/1st coincidence.jpeg'),
    caption: 'Where I started stalking you and waiting to talk to you 😝',
    fallback: '1st coincidence',
  },
  {
    src: asset('photos/Barista.jpeg'),
    caption: 'My first coffee date in my life — and it was with you.',
    fallback: 'Barista',
  },
  {
    src: asset('photos/2nd meet.jpeg'),
    caption: 'Our second meet — already feeling a little more familiar.',
    fallback: '2nd meet',
  },
  {
    src: asset('photos/Our 3rd meet.jpeg'),
    caption: 'I keep thinking about your happiness — always trying to make you feel happy.',
    fallback: 'Our 3rd meet',
  },
  {
    src: asset('photos/qubaa.jpeg'),
    caption: 'Qubaa — a soft day, a sweet memory, and you.',
    fallback: 'Qubaa',
  },
];

export const writtenMemories = [
  {
    title: 'The first laugh',
    text: 'The first memory I have with you is from June 13, when we had our very first long conversation. I remember feeling a little awkward at first, but shikha made the conversation fun by roasting u the whole time. It made me laugh more than I expected. You looked so innocent that day, and I really liked that about you. That simple conversation became a memory I will always cherish because it was the beginning',
  },
  {
    title: 'Small talks',
    text: 'Even the tiniest conversations somehow stayed with me longer than they should have.',
  },
  {
    title: 'Quiet presence',
    text: 'Some people fill silence. You make silence feel comfortable.',
  },
  { 
    title: 'Everyday magic',
    text: 'Just a week after we met, we were spending time together every single day. It felt almost magical. Somehow, even the most ordinary moments became special whenever I was with you. Thank you for standing by my side during one of the hardest times in my life. Your presence brought me comfort, laughter, and strength when I needed it the most. I wil always be grateful for those moments we shared—they mean more to me than words can express💫✨',
  },
];

export const balloonWishes = [
  {
    id: 1,
    emoji: '🤍',
    label: 'Soft start',
    wish: 'May every morning feel gentle, and every night feel safe.',
    tint: '#c9b8e8',
  },
  {
    id: 2,
    emoji: '🌸',
    label: 'Bloom',
    wish: 'May this year bloom in quiet, beautiful ways around you.',
    tint: '#9b7bb8',
  },
  {
    id: 3,
    emoji: '✨',
    label: 'Sparkle',
    wish: 'Keep that rare sparkle — even on the plainest days.',
    tint: '#7a5f9a',
  },
  {
    id: 4,
    emoji: '🌙',
    label: 'Calm',
    wish: 'May your mind find soft landings whenever it needs rest.',
    tint: '#a8d9b8',
  },
  {
    id: 5,
    emoji: '🥂',
    label: 'Cheers',
    wish: 'To Sanjai — more laughter, softer days, and wishes that come true.',
    tint: '#7eb89a',
  },
];

export const reasonCards = [
  { emoji: '😊', title: 'Your innocent face', text: 'Looks so cute..but are not innocent at all.' },
  {
    emoji: '☺️',
    title: 'Your smile',
    text: 'When you smile, you look even more handsome and smart — and that dimple on your face is so cute. Just keep smiling like that. Aha… I think someone is smiling by reading this. Hahaha.',
  },
  { emoji: '🎧', title: 'Your vibe', text: 'Calm, bright and always comforting.Thats what i love about you.' },
  { emoji: '🌿', title: 'Your presence', text: 'My cheeks will start hurting cz, i will be keep smiling when i am with you :)' },
  { emoji: '☀️', title: 'Your energy', text: 'You\'re always so energetic — and when you\'re beside someone, they start feeling that energy too.' },
];

export const constellationNotes = [
  'You are someone rare.',
  'Your kindness leaves a mark.',
  'The world feels softer near you.',
  'You deserve gentle days.',
  'Your smile is a whole season.',
  'The world needs more hearts like yours.',
  'Your presence makes people feel safe.',
  'Stay soft. Stay glowing.',
];

export const letterLines = [
  'Hey Sanjai,',
  'If I could wrap a feeling into a birthday wish,',
  'it would be this: may you always feel seen,',
  'may your days stay soft around the edges,',
  'and may every season bring you closer to the life you dream about.',
  'It\'s funny how someone you\'ve known for only a short time can become such an important part of your days. Thank you for all the laughter, the support, and the memories we\'ve made together. I hope life gives you the same kindness that you give to others. Happy Birthday!🎉',
  '— someone who thinks of you more often than you know',
];

export const bouquetImage = asset('photos/bouquet.jpg');

export const bouquetMessage =''
export const bouquetMeaning = [
  { emoji: '🌹', text: '6 red roses — sincere admiration' },
  { emoji: '🌻', text: '2 sunflowers — warmth & brighter days' },
];

export const cakeName = 'sleepy guy';

export const cakeWishes = [
  'sweet dreams & soft days',
  'Happy Birthday',
  'may your year feel gentle',
];
