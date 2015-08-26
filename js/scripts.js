var vent = _.extend({}, Backbone.Events),
	sorted = false;

var TodoItem = Backbone.Model.extend({
	defaults: {
		title: 'No title',
		description: 'No description',
		done: false,
		creationDate: ''
	}
});

var TodoCollection = Backbone.Collection.extend({
	model: TodoItem,
	
	comparator: function (a) {
		return a.get(this.comparatorString);
	},

	initialize: function(){
		this.comparatorString = 'title';
		vent.on('collection:sort', this.sortCollection, this);
	},

	sortCollection: function(data){
		this.comparatorString = data;
		console.log(this.comparatorString);
		this.sort();
		vent.trigger('collectionView:render');
	}
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
		vent.on('collectionView:render', this.render, this);
		this.listenTo(this.collection, 'reset', this.render);
		this.listenTo(this.collection, 'change', this.render);
	},

	render: function(){
		this.$el.html('');
		this.collection.each(this.renderSingleItem, this);
		$('#todo').html(this.$el);
	},

	renderSingleItem : function(item, index){
		console.log(index);
		var itemView = new TodoSingleView({ model:item }),
			counter = $(itemView.render().el).prepend((index+1)+"- ");
		this.$el.append(counter);
	},

	saveToLocalStorage: function(){
		localStorage.setItem('todo1', JSON.stringify(this.collection.toJSON()));
	},

	sortCollection: function(data){
		this.sortedCollection = this.collection.sortBy(data);
		this.render();
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
		new TodoItem({title:'Tarea de prueba',description:'prueba description',done:false, creationDate:'18-01-2014'}),
		new TodoItem({title:'Aprender Backbone.js',description:'views events models collections',done:true, creationDate:'10-01-2015'}),
		new TodoItem({title:'Best practices JavaScript',description:'views events models collections',done:false, creationDate:'01-01-2016'})
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