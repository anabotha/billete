
import Link from "next/link"

const Choices = () => {
  const items = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Metas", path: "/meta" },
    { title: "Ingresos", path: "/ingresos" },
    { title: "Proyectos", path: "/proyectos" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      
      {items.map((item) => (
        <Link key={item.title} href={item.path} className="block">
          
          <div className="cursor-pointer border border-gray-200 dark:border-zinc-700
          bg-white dark:bg-zinc-900
          rounded-xl shadow-md p-8
          flex flex-col items-center justify-center
          hover:border-zinc-400 dark:hover:border-zinc-500
          transition">
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {item.title}
            </h2>

          </div>

        </Link>
      ))}

    </div>
  )
}

export default Choices