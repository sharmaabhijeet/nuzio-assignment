import { demoStories } from '../../shared/stories';
export const sampleArticles = demoStories.map((story) => ({ ...story, id: story.slug }));
const demoAudio = new Map(demoStories.map((story) => [story.slug, story.audioUrl]));
export const getAudioSource = (article) =>
  article?.audioUrl || demoAudio.get(article?.slug) || null;
export const withoutIcon = (value) => value.slice(value.indexOf(' ') + 1);
