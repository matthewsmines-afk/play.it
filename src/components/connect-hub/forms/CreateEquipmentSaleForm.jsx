import React, { useState } from 'react';
import { ConnectPost } from '@/entities/ConnectPost';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEquipmentSaleForm({ currentUser, onPostCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        condition: 'used_good',
        location: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.price || !formData.location) {
            toast.error("Please fill all fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const postData = {
                post_type: 'equipment_sale',
                created_by_user_id: currentUser.id,
                created_by_user_name: currentUser.full_name,
                title: formData.title,
                description: formData.description,
                location_text: formData.location,
                specific_fields: {
                    price: parseFloat(formData.price),
                    item_condition: formData.condition,
                }
            };
            await ConnectPost.create(postData);
            toast.success("Your item has been listed for sale!");
            onPostCreated();
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("Failed to create post.");
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div className="space-y-2">
                <Label>Item Name / Title</Label>
                <Input
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Nike Phantom Football Boots, Size 6"
                    required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                        type="number"
                        value={formData.price}
                        onChange={e => handleInputChange('price', e.target.value)}
                        placeholder="e.g., 25"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={formData.condition} onValueChange={v => handleInputChange('condition', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used_like_new">Used - Like New</SelectItem>
                            <SelectItem value="used_good">Used - Good</SelectItem>
                            <SelectItem value="used_fair">Used - Fair</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Provide details about the item..."
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Your Location</Label>
                <Input
                    value={formData.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                    placeholder="e.g., North London"
                    required
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Publish Post
                </Button>
            </div>
        </form>
    );
}