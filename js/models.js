/**
 * Core data models for the Screenshot Mockup Tool
 */

// Unique ID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// State management for undo/redo functionality
class UndoManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 20;
    }

    saveState(state) {
        this.undoStack.push(state);
        
        // Clear redo stack when a new state is saved
        this.redoStack = [];
        
        // Limit stack size
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length <= 1) return null;
        
        // Move current state to redo stack
        const currentState = this.undoStack.pop();
        this.redoStack.push(currentState);
        
        // Return the previous state
        return this.undoStack[this.undoStack.length - 1];
    }

    redo() {
        if (this.redoStack.length === 0) return null;
        
        // Move the last redone state back to the undo stack
        const stateToRedo = this.redoStack.pop();
        this.undoStack.push(stateToRedo);
        
        return stateToRedo;
    }

    get canUndo() {
        return this.undoStack.length > 1;
    }

    get canRedo() {
        return this.redoStack.length > 0;
    }
}

// Export the models
window.Models = {
    generateUUID,
    UndoManager
};