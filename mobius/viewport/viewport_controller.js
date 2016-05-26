//
// mobius viewport controller for viewport directive
// This functions of viewport directive will be invoked through mobius module
//

mobius.controller('viewportCtrl',[
    '$scope','$rootScope',
    function($scope,$rootScope) {

        $scope.topoViewportControl = {};

        $scope.viewportControl = {
            "geometryData":{},
        };

        $scope.geometryData = {};

        $scope.tableHeader = [];
        for(var topo in MOBIUS.TOPOLOGY_DEF) {
            $scope.tableHeader.push(topo);
        }
        $scope.tableHeader.push('object');
        $scope.currentHeader = $scope.tableHeader[0];

        $rootScope.$on('Update Datatable', function(){
            $scope.generateDataTable( $scope.currentHeader)
        });

        $scope.generateDataTable = function(header){

            // todo create different data table

            $scope.currentHeader = header;
            var propertyList = {};
            var columnDefs = {};
            $scope.gridOptions = [];
            var table = {};

            angular.copy($scope.viewportControl.geometryData,$scope.geometryData);

            for(var port in $scope.geometryData){
                propertyList[port] = [];
                columnDefs[port] = [];
                table[port] = [];

                if(header !== undefined){
                    for(var i = 0; i < $scope.geometryData[port].length; i++){
                        if($scope.geometryData[port][i].cate !== header){
                            $scope.geometryData[port].splice(i,1);
                            i--;
                        }
                    }
                }

                for(var i = 0; i < $scope.geometryData[port].length; i++){
                    if($scope.geometryData[port][i].Property !== undefined){
                        if(propertyList[port].indexOf($scope.geometryData[port][i].Property) === -1){
                            propertyList[port].push($scope.geometryData[port][i].Property);
                        }
                    }
                }

                columnDefs[port] = [{ field: 'attachedTo', displayName: 'AttachedTo'}];

                for(var i = 0; i < propertyList[port].length;i++){
                    columnDefs[port].push({
                        field:propertyList[port][i],
                        displayName:propertyList[port][i]
                    })
                }

                for(var i = 0; i < $scope.geometryData[port].length; i++){
                    if(table[port].length === 0){
                        table[port].push({attachedTo: $scope.geometryData[port][i].attachedTo});

                        table[port][0][$scope.geometryData[port][i].Property]
                            = $scope.geometryData[port][i].Value;
                    }

                    for(var j = 0; j < table[port].length; j++){
                        if(table[port][j].attachedTo === $scope.geometryData[port][i].attachedTo ){
                            table[port][j][$scope.geometryData[port][i].Property] = $scope.geometryData[port][i].Value;
                            break;
                        }else{
                            if(j === table[port].length-1){
                                table[port].push({attachedTo: $scope.geometryData[port][i].attachedTo});

                                table[port][table[port].length-1][$scope.geometryData[port][i].Property]
                                    = $scope.geometryData[port][i].Value;
                            }
                        }
                    }
                }

                $scope.gridOptions.push( {
                    data: "geometryData['"+ port +"']",
                    columnDefs:columnDefs[port]
                });
            }

            $scope.geometryData = table;
        };

        //$scope.gridOptions = [];


        $scope.viewportControl.layout = 'singleView';
        $scope.topoViewportControl.layout = 'singleView';
        $scope.topoViewportControl.LT = false;
        $scope.topoViewportControl.RT = false;
        $scope.topoViewportControl.LB = false;
        $scope.topoViewportControl.RB = false;

        document.getElementById("LT1").style.display = "none";
        document.getElementById("RT1").style.display = "none";
        document.getElementById("LB1").style.display = "none";
        document.getElementById("RB1").style.display = "none";

        $scope.viewportControl.showGeometry = true;
        $scope.showGeometry = true;
        $scope.showFullCode = false;
        $scope.showData = false;
        $scope.showTopology = false;


        $scope.showGeometryLT = true;
        $scope.showGeometryRT = true;
        $scope.showGeometryLB = true;
        $scope.showGeometryRB = true;

        if($scope.showTopology === false){
            document.getElementById("topoContainer").style.display = "none";
        }

        $rootScope.$on('singleView', function(){
            $scope.viewportControl.layout = 'singleView';
            $scope.topoViewportControl.layout = 'singleView';
            $scope.viewportControl.showGeometry =true;
            document.getElementById("viewSingle").style.display = "inline";
            document.getElementById("LT1").style.display = "none";
            document.getElementById("RT1").style.display = "none";
            document.getElementById("LB1").style.display = "none";
            document.getElementById("RB1").style.display = "none";

            $scope.showData = false;
            $scope.showFullCode = false;
        });

        $rootScope.$on('fourViews', function(){
            $scope.viewportControl.layout = 'fourViews';
            $scope.topoViewportControl.layout = 'fourViews';

            if($scope.showTopologyLT){
                document.getElementById("LT1").style.display = "inline";
            }

            if($scope.showTopologyRT){
                document.getElementById("RT1").style.display = "inline";
            }

            if($scope.showTopologyLB){
                document.getElementById("LB1").style.display = "inline";
            }

            if($scope.showTopologyRB){
                document.getElementById("RB1").style.display = "inline";
            }


            $scope.viewportControl.showGeometry= false;
            document.getElementById("viewSingle").style.display = "none";
            document.getElementById("topoContainer").style.display = "none";

            $scope.showData = false;
            $scope.showFullCode = false;
        });

        $scope.toggleFullCode = function(view){
            switch (view){
                case 'main':
                    $scope.viewportControl.currentCate = 'Code';
                    $scope.viewportControl.showGeometry = false;
                    $scope.showGeometry = false;
                    $scope.showFullCode = true;
                    $scope.showData = false;
                    $scope.showTopology = false;
                    document.getElementById("viewSingle").style.display = "none";
                    break;
                case 'LT':
                    $scope.viewportControl.LTcurrentCate = 'Code';
                    $scope.showGeometryLT = false;
                    $scope.showFullCodeLT = true;
                    $scope.showDataLT = false;
                    $scope.showTopologyLT = false;
                    document.getElementById("viewLT").style.display = "none";
                    $scope.topoViewportControl.LT = false;
                    document.getElementById("LT1").style.display = "none";
                    break;
                case 'LB':
                    $scope.viewportControl.LBcurrentCate = 'Code';
                    $scope.showGeometryLB = false;
                    $scope.showFullCodeLB = true;
                    $scope.showDataLB = false;
                    $scope.showTopologyLB = false;
                    document.getElementById("viewLB").style.display = "none";
                    $scope.topoViewportControl.LB = false;
                    document.getElementById("LB1").style.display = "none";
                    break;
                case 'RT':
                    $scope.viewportControl.RTcurrentCate = 'Code';
                    $scope.showGeometryRT = false;
                    $scope.showFullCodeRT = true;
                    $scope.showDataRT = false;
                    $scope.showTopologyRT = false;
                    document.getElementById("viewRT").style.display = "none";
                    $scope.topoViewportControl.RT = false;
                    document.getElementById("RT1").style.display = "none";
                    break;
                case 'RB':
                    $scope.viewportControl.RBcurrentCate = 'Code';
                    $scope.showGeometryRB = false;
                    $scope.showFullCodeRB = true;
                    $scope.showDataRB = false;
                    $scope.showTopologyRB = false;
                    document.getElementById("viewRB").style.display = "none";
                    $scope.topoViewportControl.RB = false;
                    document.getElementById("RB1").style.display = "none";
                    break;
            }
        };

        $scope.toggleGeometry = function(view){
            switch (view){
                case 'main':
                    $scope.viewportControl.currentCate = $scope.viewportControl.currentView;
                    $scope.viewportControl.showGeometry = true;
                    $scope.showGeometry = true;
                    $scope.showFullCode = false;
                    $scope.showData = false;
                    $scope.showTopology = false;
                    document.getElementById("viewSingle").style.display = "inline";
                    document.getElementById("topoContainer").style.display = "none";
                    break;
                case 'LT':
                    $scope.viewportControl.LTcurrentCate = $scope.viewportControl.LTcurrentView;
                    $scope.showGeometryLT = true;
                    $scope.showFullCodeLT = false;
                    $scope.showDataLT = false;
                    $scope.showTopologyLT = false;
                    document.getElementById("viewLT").style.display = "inline";
                    $scope.topoViewportControl.LT = false;
                    document.getElementById("LT1").style.display = "none";
                    break;
                case 'LB':
                    $scope.viewportControl.LBcurrentCate = $scope.viewportControl.LBcurrentView;
                    $scope.showGeometryLB = true;
                    $scope.showFullCodeLB = false;
                    $scope.showDataLB = false;
                    $scope.showTopologyLB = false;
                    document.getElementById("viewLB").style.display = "inline";
                    $scope.topoViewportControl.LB = false;
                    document.getElementById("LB1").style.display = "none";
                    break;
                case 'RT':
                    $scope.viewportControl.RTcurrentCate = $scope.viewportControl.RTcurrentView;
                    $scope.showGeometryRT = true;
                    $scope.showFullCodeRT = false;
                    $scope.showDataRT = false;
                    $scope.showTopologyRT = false;
                    $scope.topoViewportControl.RT = false;
                    document.getElementById("viewRT").style.display = "inline";
                    document.getElementById("RT1").style.display = "none";
                    break;
                case 'RB':
                    $scope.viewportControl.RBcurrentCate = $scope.viewportControl.RBcurrentView;
                    $scope.showGeometryRB = true;
                    $scope.showFullCodeRB = false;
                    $scope.showDataRB = false;
                    $scope.showTopologyRB = false;
                    $scope.topoViewportControl.RB = false;
                    document.getElementById("viewRB").style.display = "inline";
                    document.getElementById("RB1").style.display = "none";
                    break;
            }
        };

        $scope.toggleData = function(view){
            switch (view){
                case 'main':
                    $scope.viewportControl.currentCate = 'Data';
                    $scope.viewportControl.showGeometry = false;
                    $scope.showGeometry = false;
                    $scope.showFullCode = false;
                    $scope.showData = true;
                    $scope.showTopology = false;
                    document.getElementById("viewSingle").style.display = "none";
                    document.getElementById("topoContainer").style.display = "none";
                    break;
                case 'LT':
                    $scope.viewportControl.LTcurrentCate = 'Data';
                    $scope.showGeometryLT = false;
                    $scope.showFullCodeLT = false;
                    $scope.showDataLT = true;
                    $scope.showTopologyLT = false;
                    document.getElementById("viewLT").style.display = "none";
                    $scope.topoViewportControl.LT = false;
                    document.getElementById("LT1").style.display = "none";
                    break;
                case 'LB':
                    $scope.viewportControl.LBcurrentCate = 'Data';
                    $scope.showGeometryLB = false;
                    $scope.showFullCodeLB = false;
                    $scope.showDataLB = true;
                    $scope.showTopologyLB = false;
                    document.getElementById("viewLB").style.display = "none";
                    $scope.topoViewportControl.LB = false;
                    document.getElementById("LB1").style.display = "none";
                    break;
                case 'RT':
                    $scope.viewportControl.RTcurrentCate = 'Data';
                    $scope.showGeometryRT = false;
                    $scope.showFullCodeRT = false;
                    $scope.showDataRT = true;
                    $scope.showTopologyRT = false;
                    document.getElementById("viewRT").style.display = "none";
                    $scope.topoViewportControl.RT = false;
                    document.getElementById("RT1").style.display = "none";
                    break;
                case 'RB':
                    $scope.viewportControl.RBcurrentCate = 'Data';
                    $scope.showGeometryRB = false;
                    $scope.showFullCodeRB = false;
                    $scope.showDataRB = true;
                    $scope.showTopologyRB = false;
                    document.getElementById("viewRB").style.display = "none";
                    $scope.topoViewportControl.RB = false;
                    document.getElementById("RB1").style.display = "none";
                    break;
            }
        };

        $scope.toggleTopology = function(view){
            switch (view){
                case 'main':
                    $scope.viewportControl.currentCate = 'Topology';
                    $scope.viewportControl.showGeometry = false;
                    $scope.topoViewportControl.showTopology = true;
                    $scope.showGeometry = false;
                    $scope.showFullCode = false;
                    $scope.showData = false;
                    document.getElementById("viewSingle").style.display = "none";
                    document.getElementById("topoContainer").style.display = "inline";
                    break;
                case 'LT':
                    $scope.viewportControl.LTcurrentCate = 'Topology';
                    $scope.showGeometryLT = false;
                    $scope.showFullCodeLT = false;
                    $scope.showDataLT = false;
                    $scope.showTopologyLT = true;
                    document.getElementById("viewLT").style.display = "none";
                    $scope.topoViewportControl.LT = true;
                    document.getElementById("LT1").style.display = "inline";
                    break;
                case 'LB':
                    $scope.viewportControl.LBcurrentCate = 'Topology';
                    $scope.showGeometryLB = false;
                    $scope.showFullCodeLB = false;
                    $scope.showDataLB = false;
                    $scope.showTopologyLB = true;
                    document.getElementById("viewLB").style.display = "none";
                    $scope.topoViewportControl.LB = true;
                    document.getElementById("LB1").style.display = "inline";
                    break;
                case 'RT':
                    $scope.viewportControl.RTcurrentCate = 'Topology';
                    $scope.showGeometryRT = false;
                    $scope.showFullCodeRT = false;
                    $scope.showDataRT = false;
                    $scope.showTopologyRT = true;
                    document.getElementById("viewRT").style.display = "none";
                    document.getElementById("RT1").style.display = "inline";
                    $scope.topoViewportControl.RT = true;
                    break;
                case 'RB':
                    $scope.viewportControl.RBcurrentCate = 'Topology';
                    $scope.showGeometryRB = false;
                    $scope.showFullCodeRB = false;
                    $scope.showDataRB = false;
                    $scope.showTopologyRB = true;
                    document.getElementById("viewRB").style.display = "none";
                    document.getElementById("RB1").style.display = "inline";
                    $scope.topoViewportControl.RB = true;
                    break;
            }

        };
    }
]);