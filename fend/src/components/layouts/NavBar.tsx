
export default function NavBar({ title }: { title: String }) {
  return (
    <>
      <div className=" flex text-xl m-1 font-semibold text-gray-900  p-4 border-b border-gray-200 gap-3"> Smart Meter <div className="h-8 w-0.5 bg-black opacity-20"></div> <span className="opacity-70">{title}</span> </div>
    </>
  );
}
