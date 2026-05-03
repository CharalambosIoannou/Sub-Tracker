/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/Dashboard';
import { SubscriptionList } from './components/SubscriptionList';
import { Insights } from './components/Insights';
import { Modal } from './components/ui/Modal';
import { SubscriptionForm } from './components/SubscriptionForm';
import { useSubscriptions } from './hooks/useSubscriptions';
import { Subscription } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState<Subscription | null>(null);
  
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions();

  const handleAdd = (sub: Parameters<typeof addSubscription>[0]) => {
    addSubscription(sub);
    setIsAddOpen(false);
  };

  const handleEdit = (updates: Parameters<typeof addSubscription>[0]) => {
    if (subToEdit) {
      updateSubscription(subToEdit.id, updates);
      setSubToEdit(null);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard subscriptions={subscriptions} />;
      case 'subscriptions':
        return (
          <SubscriptionList 
            subscriptions={subscriptions} 
            onUpdate={updateSubscription}
            onDelete={deleteSubscription}
            onAddClick={() => setIsAddOpen(true)}
            onEditClick={(sub) => setSubToEdit(sub)}
          />
        );
      case 'insights':
        return <Insights subscriptions={subscriptions} />;
      default:
        return <Dashboard subscriptions={subscriptions} />;
    }
  };

  return (
    <>
      <AppLayout 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        onAddClick={() => setIsAddOpen(true)}
      >
        {renderContent()}
      </AppLayout>

      <Modal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)}
        title="Add Subscription"
      >
        <SubscriptionForm 
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={!!subToEdit} 
        onClose={() => setSubToEdit(null)}
        title="Edit Subscription"
      >
        {subToEdit && (
          <SubscriptionForm 
            initialData={subToEdit}
            onSubmit={handleEdit}
            onCancel={() => setSubToEdit(null)}
          />
        )}
      </Modal>
    </>
  );
}
