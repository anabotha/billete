import Choices from "../components/choices";
export default function Home() {
  return (
<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-900">
    <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-20 px-8 bg-white dark:bg-zinc-900 mx-auto">
     
      <Choices></Choices>
      </main>
    </div>
  );
}
