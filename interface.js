function hiddenFirstMap(){
  const firstMap = document.getElementById('firstMap');
  const secondMap = document.getElementById('secondMap');
  
  firstMap.style.display = "none";
  secondMap.style.display = "block";

  handleCoords();
}
