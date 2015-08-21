var vent = _.extend({}, Backbone.Events),
	sorted = false;

var TodoItem = Backbone.Model.extend({
	defaults: {
		title: 'No title',
		description: 'No description',
		done: false
	}
});

var TodoCollection = Backbone.Collection.extend({
	model: TodoItem
});

var TodoSingleView = Backbone.View.extend({
	tagName: 'li',
	events: {
		'click .delete': 'destroyItem',
		'click .change': 'changeTitle'
	},

	initialize: function(){
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'change', function(){
			vent.trigger('collection:saveToLocalStorage');
		});
		this.listenTo(this.model, 'destroy', this.removeView);
		this.listenTo(this.model, 'destroy', function(){
		});
	},

	render: function(){
		console.log('render model');
		this.$el.html(this.model.get('title'));
		this.$el.append('  <button class="delete">Eliminar</button>');
		this.$el.append('  <button class="change">Change</button>');
		return this;
	},

	destroyItem: function(){
		this.model.destroy();
		vent.trigger('collection:saveToLocalStorage');
	},

	removeView: function(){
		this.el.remove();
	},

	changeTitle: function(){
		this.model.set('title', 'madafaka');
	}
});

var TodosList = Backbone.View.extend({
	tagName: 'ul',

	initialize: function(){
		this.render();
		vent.on('collection:saveToLocalStorage', this.saveToLocalStorage, this);
		vent.on('collection:sort', this.sortCollection, this);
		this.listenTo(this.collection, 'reset', this.render);
	},

	render: function(){
		this.$el.html('');
		if(sorted){
			this.collection.each(this.renderSingleItem, this);
			$('#todo').html(this.$el);
		}else{
			this.collection.each(this.renderSingleItem, this);
			$('#todo').html(this.$el);
		}
	},

	renderSingleItem : function(item){
		var itemView = new TodoSingleView({ model:item });
		this.$el.append(itemView.render().el);
	},

	saveToLocalStorage: function(){
		localStorage.setItem('todo1', JSON.stringify(this.collection.toJSON()));
	},

	sortCollection: function(data){
		sorted = true;
		localStorage.setItem('todo1Sorted', JSON.stringify(this.collection.sortBy(data)));
		this.collection.reset(JSON.parse(localStorage.getItem('todo1Sorted')));
	}

});

var Sorter = Backbone.View.extend({
	el: '#sort',
	events: {
		'click button': 'getSortOption'
	},

	getSortOption: function(ev){
		var current = $(ev.currentTarget),
			data = current.data('sort-by');
		vent.trigger('collection:sort', data);
	}
});

var tasks;
if(localStorage.getItem('todo1') === null){
	tasks = new TodoCollection([
		new TodoItem({title:'3 Tarea de prueba',description:'prueba description',done:false}),
		new TodoItem({title:'2 Aprender Backbone.js',description:'views events models collections',done:true}),
		new TodoItem({title:'1 Aprender angular.js',description:'views events models collections',done:false})
	]);
	localStorage.setItem('todo1', JSON.stringify(tasks.toJSON()));
}else{
	tasks = new TodoCollection(JSON.parse(localStorage.getItem('todo1')));
}

var listado = new TodosList({ collection:tasks });
new Sorter;
var clean = function(){
	localStorage.removeItem('todo1');
	localStorage.removeItem('todo1Sorted');
}