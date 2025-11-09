
import React, { useState, useEffect } from 'react';
import { ConnectPost } from '@/entities/ConnectPost';
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import FilterBar from '../components/connect-hub/FilterBar';
import PostCard from '../components/connect-hub/PostCard';
import CreatePostModal from '../components/connect-hub/CreatePostModal';
import EditPostModal from '../components/connect-hub/EditPostModal';

export default function ConnectHub() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [filters, setFilters] = useState({
    postType: 'all',
    location: '',
    ageGroups: []
  });
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsData, user, teamsData, playersData] = await Promise.all([
        ConnectPost.filter({ is_active: true }, '-created_date'),
        User.me(),
        Team.list(),
        Player.list()
      ]);

      setPosts(postsData || []);
      setCurrentUser(user);
      setTeams(teamsData || []);
      setPlayers(playersData || []);

      // Filter posts created by current user
      const userPosts = (postsData || []).filter(post => 
        post.created_by_user_id === user.id
      );
      setMyPosts(userPosts);

    } catch (error) {
      console.error('Error loading Connect Hub data:', error);
    }
    setIsLoading(false);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredPosts = posts.filter(post => {
    // Type filter
    if (filters.postType !== 'all' && post.post_type !== filters.postType) {
      return false;
    }

    // Location filter (basic text match)
    if (filters.location && post.location_text) {
      if (!post.location_text.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Age group filter
    if (filters.ageGroups.length > 0 && post.age_groups) {
      const hasMatchingAge = filters.ageGroups.some(age => 
        post.age_groups.includes(age)
      );
      if (!hasMatchingAge) return false;
    }

    return true;
  });

  const handleCreatePost = async (postData) => {
    try {
      await ConnectPost.create(postData);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleEditPost = async (postId, postData) => {
    try {
      await ConnectPost.update(postId, postData);
      setEditingPost(null);
      loadData();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await ConnectPost.delete(postId);
      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleMarkAsFulfilled = async (postId) => {
    try {
      await ConnectPost.update(postId, { is_active: false });
      loadData();
    } catch (error) {
      console.error('Error marking post as fulfilled:', error);
      alert('Failed to mark post as fulfilled. Please try again.');
    }
  };

  const handleRenewPost = async (postId) => {
    try {
      await ConnectPost.update(postId, { 
        is_active: true,
        created_date: new Date().toISOString() // Refresh the created date
      });
      loadData();
    } catch (error) {
      console.error('Error renewing post:', error);
      alert('Failed to renew post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#2D2C29" }}>
      {/* FIXED: Header with white text */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="h-11 w-11 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Connect Hub</h1>
            <p className="text-sm text-white/70">Find players, teams, and opportunities</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-slate-900 hover:bg-white/90 gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Post</span>
          </Button>
        </div>
      </div>

      {/* White content area */}
      <div className="bg-white rounded-t-3xl -mt-2 relative z-10">
        <div className="p-4 md:p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="my-posts">
                My Posts {myPosts.length > 0 && `(${myPosts.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6 mt-6">
              <FilterBar filters={filters} onFilterChange={handleFilterChange} />

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No posts match your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onEdit={(post) => setEditingPost(post)}
                        onDelete={handleDeletePost}
                        onMarkAsFulfilled={handleMarkAsFulfilled}
                        showActions={false} // No actions on discover tab
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-posts" className="space-y-6 mt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : myPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">You haven't created any posts yet</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {myPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onEdit={(post) => setEditingPost(post)}
                        onDelete={handleDeletePost}
                        onMarkAsFulfilled={handleMarkAsFulfilled}
                        onRenew={handleRenewPost}
                        showActions={true} // Show actions on my posts tab
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {showCreateModal && (
            <CreatePostModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreatePost}
              currentUser={currentUser}
              teams={teams}
              players={players}
            />
          )}

          {editingPost && (
            <EditPostModal
              isOpen={!!editingPost}
              post={editingPost}
              onClose={() => setEditingPost(null)}
              onSubmit={(postData) => handleEditPost(editingPost.id, postData)}
              teams={teams}
              players={players}
            />
          )}
        </div>
      </div>
    </div>
  );
}
