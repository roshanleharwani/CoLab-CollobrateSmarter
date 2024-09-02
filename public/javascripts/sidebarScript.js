
    function toggleSidebar(event, section) {
      event.stopPropagation();
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.getElementById('overlay');
      if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
        if (section) {
          document.querySelector(a[href="#${section}"]).scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      }
    }

    function toggleSidebarOnBody(event) {
      if (!event.target.closest('.sidebar') && !event.target.closest('[onclick="toggleSidebar(event)"]')) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('overlay');
        if (!sidebar.classList.contains('-translate-x-full')) {
          sidebar.classList.add('-translate-x-full');
          sidebar.classList.remove('translate-x-0');
          overlay.classList.add('hidden');
        }
      }
    }

    function toggleSidebarOnOverlayClick(event) {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.getElementById('overlay');
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      overlay.classList.add('hidden');
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      const requestsMenu = document.querySelector('.requests-menu');
      const bellIcon = document.querySelector('.requests-menu img');
    
      bellIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the body
        requestsMenu.classList.toggle('show');
      });
    
      document.addEventListener('click', (event) => {
        if (!bellIcon.contains(event.target) && !requestsMenu.contains(event.target)) {
          requestsMenu.classList.remove('show');
        }
      });
    });
