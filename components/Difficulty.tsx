export function diffClass(d:string){
  if (d === "EASY") return "border-green-300 text-green-700";
  if (d === "MEDIUM") return "border-yellow-300 text-yellow-700";
  return "border-red-300 text-red-700";
}
