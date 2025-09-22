 // Composant Sidebar
    class SidebarComponent {
      constructor(containerId) {
        this.containerId = containerId;
      }
      
      render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
          <aside class="fixed top-0 left-0 h-full w-56 bg-white shadow-md z-50">
            <div class="sidebar-logo p-4 border-b">
              <h1 class="text-xl font-bold text-white">EduManager</h1>
            </div>
            <nav class="mt-4">
              <ul>
                <li class="px-4 py-3 flex items-center text-indigo-700 bg-indigo-50">
                  <i class="ri-dashboard-line mr-3"></i>
                  <span>Dashboard</span>
                </li>
                <li class="px-4 py-3 flex items-center hover:bg-gray-100 text-gray-700">
                  <i class="ri-group-line mr-3"></i>
                  <span>Classes</span>
                </li>
                <li class="px-4 py-3 flex items-center hover:bg-gray-100 text-gray-700">
                  <i class="ri-user-star-line mr-3"></i>
                  <span>Professeurs</span>
                </li>
                <li class="px-4 py-3 flex items-center hover:bg-gray-100 text-gray-700">
                  <i class="ri-book-open-line mr-3"></i>
                  <span>Cours</span>
                </li>
                
              </ul>
            </nav>
          </aside>
        `;
      }
    }