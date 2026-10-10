// Inventory dashboard logic: CRUD, search, validation, summary cards, and local storage.
const STORAGE_KEY = "yuva_inventory_products";
let products;
try { products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...initialProducts]; }
catch { products = [...initialProducts]; }

const byId = id => document.getElementById(id);
const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(value)||0);
const safe = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(products));}
function renderStats(){
 byId("totalProducts").textContent=products.length;
 byId("totalUnits").textContent=products.reduce((n,p)=>n+Number(p.quantity),0);
 byId("inventoryValue").textContent=money(products.reduce((n,p)=>n+Number(p.price)*Number(p.quantity),0));
 byId("lowStock").textContent=products.filter(p=>Number(p.quantity)<=Number(p.reorderLevel)).length;
}
function renderRows(){
 const q=byId("searchInput").value.trim().toLowerCase();
 const rows=products.filter(p=>[p.name,p.sku,p.category].some(v=>String(v).toLowerCase().includes(q)));
 byId("productRows").innerHTML=rows.length?rows.map(p=>`<tr>
 <td><b>${safe(p.name)}</b><small>${safe(p.sku)}</small></td><td>${safe(p.category)}</td>
 <td>${money(p.price)}</td><td>${p.quantity}</td><td>${p.reorderLevel}</td>
 <td><span class="status ${p.quantity<=p.reorderLevel?"low":"ok"}">${p.quantity<=p.reorderLevel?"Low stock":"In stock"}</span></td>
 <td><div class="row-actions"><button class="mini secondary" data-action="edit" data-id="${p.id}">Edit</button><button class="mini danger" data-action="delete" data-id="${p.id}">Delete</button></div></td></tr>`).join(""):'<tr><td colspan="7" class="empty">No products found.</td></tr>';
}
function render(){renderStats();renderRows();}
function openForm(p){
 byId("productForm").reset();byId("dialogTitle").textContent=p?"Edit product":"Add product";
 byId("productId").value=p?.id??"";byId("name").value=p?.name??"";byId("sku").value=p?.sku??"";
 byId("category").value=p?.category??"General";byId("price").value=p?.price??"";
 byId("quantity").value=p?.quantity??"";byId("reorderLevel").value=p?.reorderLevel??5;
 byId("productDialog").showModal();
}
byId("addProductButton").addEventListener("click",()=>openForm());
byId("closeButton").addEventListener("click",()=>byId("productDialog").close());
byId("cancelButton").addEventListener("click",()=>byId("productDialog").close());
byId("searchInput").addEventListener("input",renderRows);
byId("productForm").addEventListener("submit",event=>{
 event.preventDefault();
 const oldId=byId("productId").value;
 const p={id:oldId?Number(oldId):Date.now(),name:byId("name").value.trim(),sku:byId("sku").value.trim().toUpperCase(),
 category:byId("category").value.trim(),price:Number(byId("price").value),quantity:Number(byId("quantity").value),reorderLevel:Number(byId("reorderLevel").value)};
 if(products.some(x=>x.sku.toLowerCase()===p.sku.toLowerCase()&&x.id!==p.id)){alert("That SKU already exists.");return;}
 if(!p.name||!p.sku||p.price<0||p.quantity<0||p.reorderLevel<0){alert("Please enter valid, non-negative values.");return;}
 products=oldId?products.map(x=>x.id===p.id?p:x):[...products,p];save();byId("productDialog").close();render();
});
byId("productRows").addEventListener("click",event=>{
 const b=event.target.closest("button[data-action]");if(!b)return;
 const p=products.find(x=>x.id===Number(b.dataset.id));if(!p)return;
 if(b.dataset.action==="edit")openForm(p);
 if(b.dataset.action==="delete"&&confirm(`Delete "${p.name}"?`)){products=products.filter(x=>x.id!==p.id);save();render();}
});
byId("resetDemoButton").addEventListener("click",()=>{
 if(confirm("Reset to the original demo products?")){products=[...initialProducts];save();render();}
});
render();
