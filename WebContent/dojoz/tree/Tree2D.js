define('dojoz/tree/Tree2D', [
'dojo/_base/declare', 'dojo/_base/lang', 'dojo/colors', 'dojo/dom', 'dojo/store/Memory',
'dojox/collections/Stack', 'dojox/gfx', 'dojox/storage'
], function(declare, lang, colors, dom, Memory, Stack, gfx) {
return declare('dojoz.tree.Tree2D', null, {

  // dojox/collections/Stack
  stack: new Stack(),
  
  // dojo/store/Memory
  layout: null,

  // 默认长度单位：px.
  setting: {
    dept: 0,

    container: {
      node: null,
      height: 200,
      width: 300
    },
    
    rect: {
        height: 20,
        width: 100,
        radius: 4,
        fill: 'white',
        stroke: {
            color: 'blue',
            width: 2
        },
        spacing: 4 //间隔
    },
    
    line: {
        hline_length: 20,
        stroke: {
            color: 'blue',
            width: 2
        }
    },
    
    text: {
        font: {
            family: 'Tahoma, Helvetica, Arial, sans-serif',
            size: 14
        },
        fill: 'black'
    }
  },
  
  getStorageProvider: function() {
    var provider=dojox.storage.manager.getProvider();
    provider.initialize();
    return provider;
  },

  /**
  * 画方框，圆角
  */
  makeRect: function(surface, rect, fill, stroke) {
      var r = surface.createRect(rect);
      if(fill)   r.setFill(fill);
      if(stroke) r.setStroke(stroke);
      return r;
  },
  
  /**
   * 写文本
   */
  makeText: function(surface, text, font, fill, stroke) {
      var t = surface.createText(text);
      if(font)   t.setFont(font);
      if(fill)   t.setFill(fill);
      if(stroke) t.setStroke(stroke);
      return t;
  },
  
  /**
   * 画线段
   */
  makeLine: function(surface, line, stroke) {
      var l = surface.createLine(line);
      if(stroke) l.setStroke(stroke);
      return l;
  },
  
  evalVLine: function(point, height, childs_length) {
    var half1=height/2;
    var half2=this.setting.item_height/2;
    var line_width=this.setting.line.stroke.width;
    var half3=this.setting.line.stroke.width/2;
    var half_spacing=this.setting.rect.spacing * (childs_length-1)/2;
    
    //console.log('half1='+half1+' | half2='+half2+' | half3='+half3+' | half_spacing='+half_spacing);
    
    //var y1=point.y-half1+half2-line_width*2+half_spacing;//TODO: 错了.
    var y1=point.y-half1+half2-half3+half_spacing;//TODO: 错了.
    //var y2=point.y+half1-half2-line_width+half_spacing;
    var y2=point.y+half1-half2+half3+half_spacing;
    
    console.log('x='+point.x+' | y='+point.y);
    console.log('y1='+y1+' | y2='+y2);
    
    return {
        x1: point.x, y1: y1,
        x2: point.x, y2: y2
    };
  },

  buildTree: function(surface, datas, dept){ //console.log('dept='+dept);
    var item_width=this.layout.query({dept:dept})[0].width;

    var hline_length = this.setting.line.hline_length;
    var line_stroke = this.setting.line.stroke;
    
    var default_text=this.setting.text;
    var default_rect=this.setting.rect;

    var prev_shape_height = 0;
    var storageProvider = this.getStorageProvider();
    //storageProvider.remove('prev-shape-item-height');
    
    var _self=this;
    dojo.forEach(datas, function(item, index) {
        //if(dept===1) console.log('index='+index+' | item='+dojo.toJson(item));
        if(dept===1) console.log('index='+index+' | item='+item.height);

        //前面的水平线
        var prev_shape=_self.stack.peek();
        //if(dept===1) console.log('prev_shape1='+dojo.toJson(prev_shape));
        if(dept>=1 && prev_shape.label!=='hline') {
            
            var hline_x1 = prev_shape[prev_shape.label].x1+1,
                hline_y1 = prev_shape[prev_shape.label].y1
                         + line_stroke.width/2
                         //+ index*(default_rect.height+line_stroke.width+default_rect.spacing);
                         + index*_self.setting.item_height;

            if(item.rows!=undefined && item.height>_self.setting.item_height) {
                if(index>0) {
                    prev_shape_height += storageProvider.get('prev-shape-item-height');
                    if(dept===1) console.log('prev_shape_height='+prev_shape_height);
                    hline_y1+=item.height/2*index+prev_shape_height;
                }
            }
            //if(dept===1) console.log((item.height+prev_shape_height)/2*index);
            //console.log(hline_x1);//console.log(hline_y1);

            var hline_shape1 = {x1: hline_x1, y1: hline_y1, x2: hline_x1+hline_length, y2: hline_y1};
            _self.makeLine(surface, hline_shape1, line_stroke);

            var shape1={};
            shape1.label = 'hline';
            shape1.hline = hline_shape1;
            shape1.container = prev_shape.container;
            _self.stack.push(shape1);
        }
        
        // make Rect [矩形]
        var rect=null;
        var prev_shape2=_self.stack.peek();
        if(prev_shape2.label==='rect') {
          rect = prev_shape2[prev_shape2.label];
        }
        else if(prev_shape2.label==='hline') {
          rect = {
            height: default_rect.height,
            width: item_width,
            r: default_rect.radius,
            x: prev_shape2[prev_shape2.label].x2,
            y: prev_shape2[prev_shape2.label].y1-_self.setting.rect.height/2
          };
        }
        _self.makeRect(surface, rect, default_rect.fill, default_rect.stroke);
        // make Text [文字]
        var left = item_width/2;
        var z = 15;//TODO:不知道怎么计算这个15.
        var text = {
                x: rect.x+left,
                y: rect.y+z,
                text: item.name,
                align: 'middle'
        };
        _self.makeText(surface, text, default_text.font, default_text.fill);

        if(item.rows!=undefined) {
            storageProvider.put('prev-shape-item-height', (index===0) ?item.height/2 :item.height );
            
            // push stack，有rows才能压入上一个rect.
            var shape2={
                label: 'rect',
                rect: rect,
                container: prev_shape2.container
            };
            _self.stack.push(shape2);
            
            // make Line [后面的水平线]
            //console.log('==================make Line [后面的水平线]==================');
            var prev_shape3=_self.stack.peek();
            if(prev_shape3.rect) {
                rect = prev_shape3.rect;
            }
            else {
                rect = prev_shape3;
            }
            var hline_x = rect.x + rect.width+1;
            var hline_y = rect.y + rect.height/2;
            var hline_shape2 = {
                    x1: hline_x,
                    y1: hline_y,
                    x2: hline_x+hline_length,
                    y2: hline_y
            };
            _self.makeLine(surface, hline_shape2, line_stroke);
            
            // push stack
            var shape3={};
            shape3.label = 'hline';
            shape3.hline = hline_shape2;
            shape3.container = prev_shape3.container;
            _self.stack.push(shape3);
            
            var childs_length=item.rows.length;
            if(childs_length>=2) {
                // make Line [垂直线]
                var prev_hline=_self.stack.peek();
                var vline_shape1 = _self.evalVLine({
                    x: prev_hline.hline.x2,
                    y: prev_hline.hline.y2
                    },
                    item.height,
                    childs_length);
                _self.makeLine(surface, vline_shape1, line_stroke);

                // push stack
                var shape4={};
                shape4.label = 'vline';
                shape4.vline = vline_shape1;
                shape4.container = shape3.container;
                _self.stack.push(shape4);
            }
            //console.log('==================递归==================');
            _self.buildTree(surface, item.rows, dept+1);
        }

        _self.stack.pop();// pop vline
    });
    this.stack.pop();// pop hline
    this.stack.pop();// pop rect
    this.stack.pop();// pop hline
  },
  
  parseTree: function(datas) {
    //var default_rect=this.setting.rect;
    var _self=this;
    var total_height=0;
    dojo.forEach(datas, function(item, index) {
        if(item.rows!=undefined) {
            var parent_height=_self.parseTree(item.rows);
            total_height += item.height
                          = parent_height;
        }
        else {
            total_height += item.height
                          = _self.setting.item_height;
        }//console.log('item='+item.height);
    });
    return total_height;
  },

  create: function(datas, options) {console.log('========================================');
    this.setting=dojo.safeMixin(this.setting, options);
    
    var rect=lang.clone(this.setting.rect);
    this.setting.item_height = rect.height+rect.stroke.width+rect.spacing;//TODO:加了间隔spacing
    this.layout=new Memory({data: datas.layout});
    this.dept=datas.dept;
    
    this.parseTree(datas.items);
    if(datas.items && datas.items.length>0){
      var container=lang.clone(this.setting.container);
      
      var surface = gfx.createSurface(container.node, container.width, container.height);

      var rect_x = 10,
          rect_y = (container.height-rect.height)/2;
      var shape={
        label: 'rect',
        rect: {
          height: rect.height,
          width: rect.width,
          r: rect.radius,
          x: rect_x,
          y: rect_y
        },
        container: container
      };
      this.stack.push(shape);
      
      this.buildTree(surface, datas.items, this.setting.dept);
    }
  }

});

});
