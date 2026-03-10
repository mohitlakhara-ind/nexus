import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuthStore } from '../store/authStore';

export default function OnboardingTour({ isDashboard = false, isEditor = false }) {
  const { user } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || !user) return;

    if (isDashboard) {
      const tourCompleted = localStorage.getItem('nexus_dashboard_tour');
      if (!tourCompleted) {
        setTimeout(() => {
          const dashboardDriver = driver({
            showProgress: true,
            animate: true,
            theme: {
              colors: {
                background: '#18181b',
                text: '#f4f4f5',
                activeText: '#f4f4f5',
                line: '#3f3f46',
                buttonText: '#ffffff',
                buttonBackground: '#3b82f6',
                buttonHoverBackground: '#2563eb',
              }
            },
            steps: [
              {
                element: '#tour-new-map',
                popover: {
                  title: 'Welcome to Nexus!',
                  description: 'This is where you start. Click here to create your first problem-solving map.',
                  side: 'bottom',
                  align: 'start'
                }
              },
              {
                element: '#tour-sidebar-nav',
                popover: {
                  title: 'Navigate your Workspace',
                  description: 'Browse all community maps, or view only your own creations. You can also quickly launch templates.',
                  side: 'right',
                  align: 'start'
                }
              },
              {
                element: '#tour-search',
                popover: {
                  title: 'Find Anything',
                  description: 'Search across thousands of community problems to see how others solved similar issues.',
                  side: 'bottom',
                  align: 'center'
                }
              }
            ],
            onDestroyStarted: () => {
              localStorage.setItem('nexus_dashboard_tour', 'true');
              dashboardDriver.destroy();
            }
          });
          dashboardDriver.drive();
        }, 800);
      }
    }

    if (isEditor) {
      const editorTourCompleted = localStorage.getItem('nexus_editor_tour');
      if (!editorTourCompleted) {
        setTimeout(() => {
          const editorDriver = driver({
            showProgress: true,
            animate: true,
            theme: {
              colors: {
                background: '#18181b',
                text: '#f4f4f5',
                buttonText: '#ffffff',
                buttonBackground: '#3b82f6',
              }
            },
            steps: [
              {
                popover: {
                  title: 'The Canvas',
                  description: 'Right click or drag from node handles to create arrows. Pan around and zoom out to see the big picture.',
                  side: 'center',
                }
              },
              {
                element: '#tour-dock',
                popover: {
                  title: 'Add Nodes',
                  description: 'Add new Problems, Root Causes, or Solutions from this dock. You can also change the edge style and lock the map.',
                  side: 'top',
                  align: 'center'
                }
              },
              {
                element: '#tour-presence',
                popover: {
                  title: 'Live Collaboration',
                  description: 'Invite others to the map! You will see their live cursors and can chat inside node details in real-time.',
                  side: 'bottom',
                  align: 'end'
                }
              }
            ],
            onDestroyStarted: () => {
              localStorage.setItem('nexus_editor_tour', 'true');
              editorDriver.destroy();
            }
          });
          editorDriver.drive();
        }, 1000);
      }
    }
  }, [hasMounted, user, isDashboard, isEditor]);

  return null;
}
