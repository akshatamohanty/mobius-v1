//
// Flowchart module.
//
angular.module('flowChart', ['dragging'] )

//
// Directive that generates the rendered chart from the data model.
//
.directive('flowChart', function() {
  return {
  	restrict: 'E',
  	templateUrl: "assets/js/angular-ui/ui-flowchart/flowchart_template.html",
  	replace: true,
  	scope: {
  		chart: "=chart",
  	},

  	//
  	// Controller for the flowchart directive.
  	// Having a separate controller is better for unit testing, otherwise
  	// it is painful to unit test a directive without instantiating the DOM 
  	// (which is possible, just not ideal).
  	//
  	controller: 'FlowChartController',
  };
})

//
// Directive that allows the chart to be edited as json in a textarea.
//
.directive('chartJsonEdit', function () {
	return {
		restrict: 'A',
		scope: {
			viewModel: "="
		},
		link: function (scope, elem, attr) {

			//
			// Serialize the data model as json and update the textarea.
			//
			var updateJson = function () {
				if (scope.viewModel) {
					var json = JSON.stringify(scope.viewModel.data, null, 4);
					$(elem).val(json);
				}
			};

			//x
			// First up, set the initial value of the textarea.
			//
			updateJson();

			//
			// Watch for changes in the data model and update the textarea whenever necessary.
			//
			scope.$watch("viewModel.data", updateJson, true);

			//
			// Handle the change event from the textarea and update the data model
			// from the modified json.
			//
			$(elem).bind("input propertychange", function () {
				var json = $(elem).val();
				var dataModel = JSON.parse(json);
				scope.viewModel = new flowchart.ChartViewModel(dataModel);

				scope.$digest();
			});
		}
	}

})

//
// Controller for the flowchart directive.
// Having a separate controller is better for unit testing, otherwise
// it is painful to unit test a directive without instantiating the DOM 
// (which is possible, just not ideal).
//
.controller('FlowChartController', ['$scope', 'dragging', '$element','$rootScope', function FlowChartController ($scope, dragging, $element,$rootScope) {

	var controller = this;

	//
	// Reference to the document and jQuery, can be overridden for testting.
	//
	this.document = document;

	//
	// Wrap jQuery so it can easily be  mocked for testing.
	//
	this.jQuery = function (element) {
		return $(element);
	}

	//
	// Init data-model variables.
	//
	$scope.draggingConnection = false;
	$scope.connectorSize = 10;
	$scope.dragSelecting = false;

	// @ vidamo for zoom and pan
    $scope.scaleFactor = 2;

	/* Can use this to test the drag selection rect.
	$scope.dragSelectionRect = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	};
	*/

	//
	// Reference to the connection, connector or node that the mouse is currently over.
	//
	$scope.mouseOverConnector = null;
	$scope.mouseOverConnection = null;
	$scope.mouseOverNode = null;

	// @ vidamo for edit node name
	$scope.mouseOverName = null;

	//
	// The class for connections and connectors.
	//
	this.connectionClass = 'connection';
	this.connectorClass = 'connector';
	this.nodeClass = 'node';

	// @ vidamo for ng-attr-class
	this.nameClass = 'name';

	//
	// Search up the HTML element tree for an element the requested class.
	//
	this.searchUp = function (element, parentClass) {

		//
		// Reached the root.
		//
		if (element == null || element.length == 0) {
			return null;
		}

		// 
		// Check if the element has the class that identifies it as a connector.
		//
		if (hasClassSVG(element, parentClass)) {
			//
			// Found the connector element.
			//
			return element;
		}

		//
		// Recursively search parent elements.
		//
		return this.searchUp(element.parent(), parentClass);
	};

	//
	// Hit test and retreive node and connector that was hit at the specified coordinates.
	//
	this.hitTest = function (clientX, clientY) {

		//
		// Retreive the element the mouse is currently over.
		//
		return this.document.elementFromPoint(clientX, clientY);
	};

	//
	// Hit test and retreive node and connector that was hit at the specified coordinates.
	//
	this.checkForHit = function (mouseOverElement, whichClass) {

		//
		// Find the parent element, if any, that is a connector.
		//
		var hoverElement = this.searchUp(this.jQuery(mouseOverElement), whichClass);
		if (!hoverElement) {
			return null;
		}

		return hoverElement.scope();
	};

	//
	// Translate the coordinates so they are relative to the svg element.
	//
	this.translateCoordinates = function(x, y) {
		var svg_elem =  $element.get(0);
		var matrix = svg_elem.getScreenCTM();
		var point = svg_elem.createSVGPoint();
		point.x = x;
		point.y = y;
		return point.matrixTransform(matrix.inverse());
	};


//	Called for each mouse move on the svg element.

	$scope.mouseMove = function (evt) {

		//
		// Clear out all cached mouse over elements.
		//
		$scope.mouseOverConnection = null;
		$scope.mouseOverConnector = null;
		$scope.mouseOverNode = null;

		// @ vidamo
		$scope.mouseOverName = null;

		var mouseOverElement = controller.hitTest(evt.clientX, evt.clientY);
		if (mouseOverElement == null) {
			// Mouse isn't over anything, just clear all.
			return;
		}

		if (!$scope.draggingConnection) { // Only allow 'connection mouse over' when not dragging out a connection.

			// Figure out if the mouse is over a connection.
			var scope = controller.checkForHit(mouseOverElement, controller.connectionClass);
			$scope.mouseOverConnection = (scope && scope.connection) ? scope.connection : null;
			if ($scope.mouseOverConnection) {
				// Don't attempt to mouse over anything else.
				return;
			}
		}

		// Figure out if the mouse is over a connector.
		var scope = controller.checkForHit(mouseOverElement, controller.connectorClass);
		$scope.mouseOverConnector = (scope && scope.connector) ? scope.connector : null;
		if ($scope.mouseOverConnector) {
			// Don't attempt to mouse over anything else.
			return;
		}

		// @ vidamo
		// Figure out if the mouse is over a nodeName
		//var scope = controller.checkForHit(mouseOverElement, controller.nameClass);
		//$scope.mouseOverName = (scope && scope.node.name) ? scope.node.name : null;
		//if ($scope.mouseOverName) {
		//	// Don't attempt to mouse over anything else.
		//	return;
		//}

		// Figure out if the mouse is over a node.
		var scope = controller.checkForHit(mouseOverElement, controller.nodeClass);
		$scope.mouseOverNode = (scope && scope.node) ? scope.node : null;
		if ($scope.mouseOverName) {
			// Don't attempt to mouse over anything else.
			return;
		}
	};

	//
	// Handle mousedown on a node.
	//
	$scope.nodeMouseDown = function (evt, node) {

		var chart = $scope.chart;
		var lastMouseCoords;


		dragging.startDrag(evt, {

			//
			// Node dragging has commenced.
			//
			dragStarted: function (x, y) {

				lastMouseCoords = controller.translateCoordinates(x, y);
				//
				// If nothing is selected when dragging starts, 
				// at least select the node we are dragging.
				//
				if (!node.selected()) {
					chart.deselectAll();
					node.select();
				}
			},
			
			//
			// Dragging selected nodes... update their x,y coordinates.
			//
			dragging: function (x, y) {

				var curCoords = controller.translateCoordinates(x, y);
                $rootScope.$on("Update", function(event, message) {
                    $scope.scaleFactor = message;
                });
				var deltaX = curCoords.x*(1/$scope.scaleFactor )- lastMouseCoords.x*(1/$scope.scaleFactor);
				var deltaY = curCoords.y*(1/$scope.scaleFactor)- lastMouseCoords.y*(1/$scope.scaleFactor);
				chart.updateSelectedNodesLocation(deltaX, deltaY);

				lastMouseCoords = curCoords;

				// @vidamo dragging is considered as clicked (selected)
				var nodeIndex = chart.handleNodeClicked(node, evt.ctrlKey);
				console.log("node ",nodeIndex," selected");
				$scope.$emit("nodeIndex", nodeIndex);
			},

			//
			// The node wasn't dragged... it was clicked.
			//
			clicked: function () {
                var nodeIndex = chart.handleNodeClicked(node, evt.ctrlKey);

				// @ vidamo let controller know the current node
                console.log("node ",nodeIndex," selected");
                $scope.$emit("nodeIndex", nodeIndex);
			}

		});
	};

	//
	// Handle mousedown on a connection.
	//
	$scope.connectionMouseDown = function (evt, connection) {
		var chart = $scope.chart;
		chart.handleConnectionMouseDown(connection, evt.ctrlKey);

		// Don't let the chart handle the mouse down.
		evt.stopPropagation();
		evt.preventDefault();
	};

	// @ vidamo handle mousedown on a node name
	$scope.nameMouseDown = function (evt, node) {
		console.log('node name clicked!');
	};

	//
	// Handle mousedown on an input connector.
	//
	$scope.connectorMouseDown = function (evt, node, connector, connectorIndex, isInputConnector) {

		//
		// Initiate dragging out of a connection.
		//
		dragging.startDrag(evt, {

			//
			// Called when the mouse has moved greater than the threshold distance
			// and dragging has commenced.
			//


			dragStarted: function (x, y) {

				var curCoords = controller.translateCoordinates(x, y);

                $rootScope.$on("Update", function(event, message) {
                    $scope.scaleFactor = message;
                });

				$scope.draggingConnection = true;
				$scope.dragPoint1 = flowchart.computeConnectorPos(node, connectorIndex, isInputConnector);
				$scope.dragPoint2 = {
					x: curCoords.x*(1/$scope.scaleFactor ),
					y: curCoords.y*(1/$scope.scaleFactor )
				};
				$scope.dragTangent1 = flowchart.computeConnectionSourceTangent($scope.dragPoint1, $scope.dragPoint2);
				$scope.dragTangent2 = flowchart.computeConnectionDestTangent($scope.dragPoint1, $scope.dragPoint2);
			},

			//
			// Called on mousemove while dragging out a connection.
			//
			dragging: function (x, y) {
				var startCoords = controller.translateCoordinates(x, y);

				//
				// @ vidamo communicate with pan&zoom controller to correct scale
                //
				$rootScope.$on("Update", function(event, message) {
                    $scope.scaleFactor = message;
                });

				$scope.dragPoint1 = flowchart.computeConnectorPos(node, connectorIndex, isInputConnector);
				$scope.dragPoint2 = {
					x: startCoords.x*(1/$scope.scaleFactor ),
					y: startCoords.y*(1/$scope.scaleFactor )
				};
				$scope.dragTangent1 = flowchart.computeConnectionSourceTangent($scope.dragPoint1, $scope.dragPoint2);
				$scope.dragTangent2 = flowchart.computeConnectionDestTangent($scope.dragPoint1, $scope.dragPoint2);
			},

			//
			// Clean up when dragging has finished.
			//
			dragEnded: function () {

				if ($scope.mouseOverConnector && 
					$scope.mouseOverConnector !== connector) {

					//
					// Dragging has ended...
					// The mouse is over a valid connector...
					// Create a new connection.
					//
					$scope.chart.createNewConnection(connector, $scope.mouseOverConnector);

                    // when new connection create, emit for the update in vidamo.js
                    $scope.$emit("newEdge",connector.parentNode());
				}

				$scope.draggingConnection = false;
				delete $scope.dragPoint1;
				delete $scope.dragTangent1;
				delete $scope.dragPoint2;
				delete $scope.dragTangent2;
			},

			//
			// The connector wasn't dragged... it was clicked.
			//
			// @ vidamo add click event to connectors
			clicked: function () {
				var chart = $scope.chart;
				chart.handleConnectorClicked(connector,evt.ctrlKey);

				// don't let the chart handle the mouse down click
				evt.stopPropagation();
				evt.preventDefault();
			}
		});
	};
}])
;
