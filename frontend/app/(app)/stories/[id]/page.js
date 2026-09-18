import StoryScreen from '../../../../features/news/StoryScreen';
export default async function Page({ params }) {
  const { id } = await params;
  return <StoryScreen id={id} />;
}
