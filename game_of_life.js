var cmd = "";

function restart() {
}

function game_of_life(cfg, pat) {

    // Settings
    var is_running  = cfg.is_running;
    var is_toroidal = cfg.is_toroidal;
    var cells_x     = cfg.cells_x;
    var cells_y     = cfg.cells_y;

    // Canvas, Drawing Context and Backbuffer
    var cv = document.getElementById(cfg.cvid);
    var ctx = cv.getContext("2d");
    var cvBack = document.createElement("canvas");
    cvBack.id = "cvBack";
    cvBack.style = "";
    cvBack.width = cells_x;
    cvBack.height = cells_y;
    cvBack.style.display="none";

    var body = document.getElementsByTagName("body")[0];
    body.appendChild(cvBack);
    var ctxBack = cvBack.getContext("2d"); 

    // Colors and Styles
    var rgbaDead  = new Array( 30, 30, 35, 255);
    var rgbaAlive = new Array(255, 255, 105, 255);
    var colGrid = "#202040";
    var colGrid2 = "#252540";

    var presets = init_presets();

    var initial_pattern = 0;

    // Geometry of the simulation domain
    var cell_width = cv.width / cells_x;    // Width of a single cell in pixel
    var cell_height = cv.height / cells_y;  // Height of a single cell in pixel 

    var world_data = [ new Uint8Array(cells_x * cells_y), new Uint8Array(cells_x * cells_y)];
    var world_img = ctx.createImageData(cells_x, cells_y);

    // Set the initial Pattern
    if (pat!=null) {
      init_with_pattern(pat);
    } else {
      init_with_pattern(presets[8]);
    }

    timer = window.setInterval(tick, cfg.delay);

    //
    // Member Functions
    // 

    // Initialize with a RLE encoded Pattern
    function init_with_pattern(p) { 
      clear_cells();

      rle_decode(p.xpos, p.ypos, p.rle);
      is_toroidal = p.torodial;

      world_data[1].set(world_data[0]);

      // Update the checkbox in the html document
      var c=document.getElementById('cbToroidal');
      if (c!=null) {
         c.checked = is_toroidal;
      }
    }
  
    function init_presets() { 
      var p = new Array();
      var i = 0;

      // R-pentomino
      p[i++] = { name : "R-pentomino", 
                 xpos : 100, //45,
                 ypos : 75, //35,
                 rle  : "5b$2b2ob$b2o2b$2bo2b$5b!",
                 torodial : true };

      // Glider
      p[i++] = { name : "Glider", 
                 xpos : 10,
                 ypos : 10,
                 rle  : "bob$2bo$3o!",
                 torodial : true };


      // Spaceship B3/S23 ok
      p[i++] = { name : "Spaceship", 
                 xpos : 10,
                 ypos : 75,
                 rle  : "bo2bo$o4b$o3bo$4o!",
                 torodial : true };


      p[i++] = { name : "Trans Queen Bee Shuttle", 
                 xpos : 90,
                 ypos : 75,
                 rle  : "9bo12b$7bobo12b$6bobo11b2o$2o3bo2bo11b2o$2o4bobo13b$7bobo12b$9bo!",
                 torodial : true };


      p[i++] = { name : "Queen Bee Loop", 
                 xpos : 80,
                 ypos : 65,
                 rle  : "12bo11b$12bobo9b$13bobo8b$13bo2bo7b$13bobo8b$12bobo9b$12bo11b$3bo20b$"
                      + "2bobo19b$bo3bo18b$2b3o19b$2o3b2o17b$17b2o3b2o$19b3o2b$18bo3bob$19bobo"
                      + "2b$20bo3b$11bo12b$9bobo12b$8bobo13b$7bo2bo13b$8bobo13b$9bobo12b$11bo!",
                 torodial : true };


      // partial queen bee loop
      p[i++] = { name : "Partial Queen Bee Loop", 
                 xpos : 80,
                 ypos : 65,
                 rle  : "20b2o2b$20b2o2b$2b2o20b$2b2o20b4$3bo20b$2bobo19b$bo3bo18b$2b3o19b$2o3b"
                      + "2o17b$17b2o3b2o$19b3o2b$18bo3bob$19bobo2b$20bo3b$11bo12b$9bobo12b$8bob"
                      + "o13b$7bo2bo13b$8bobo13b$9bobo12b$11bo!",
                 torodial : true };

      p[i++] = { name : "Tagalong for two lightweight spaceships", 
                 xpos : 10,
                 ypos : 70,
                 rle  : "21bo3b$18b4o3b$13bo2bob2o5b$13bo11b$4o8bo3bob2o5b$o3bo5b2ob2obobob5o$o"
                      + "9b2obobobo2b5o$bo2bo2b2o2bo3b3o2bob2ob$6bo2bob2o12b$6bo4b2o12b$6bo2bob"
                      + "2o12b$bo2bo2b2o2bo3b3o2bob2ob$o9b2obobobo2b5o$o3bo5b2ob2obobob5o$4o8bo"
                      + "3bob2o5b$13bo11b$13bo2bob2o5b$18b4o3b$21bo!",
                 torodial : true };

      p[i++] = { name : "Glider Duplicator", 
                 xpos : 12,
                 ypos : 42,
                 rle  : "44b2o4b$44b2o4b9$41b2obob2o2b2$41bo5bo2b2$42b2ob2o3b$44bo5b3$38b2o6bo"
                      + "3b$37bobo5bobo2b$12bo26bo4bo3bob$13bo30b5ob$11b3o29b2o3b2o$44b5ob$45b"
                      + "3o2b$46bo3b$24b2o4b3o17b$24b2o6bo17b$31bo18b5$23b2o25b$22bobo21b2o2b$"
                      + "24bo21b2o2b$13bo36b$12b4o34b$11b2obobo6bobo24b$2o8b3obo2bo3bo3bo24b$2o"
                      + "9b2obobo4bo28b$12b4o4bo4bo24b$13bo7bo28b$21bo3bo6b2o16b$23bobo6bobo15b"
                      + "$34bo15b$34b2o!",
                 torodial : false };

      p[i++] = { name : "Twogun", 
                 xpos : 12,
                 ypos : 12,
                 rle  : "27bo11b$25bobo11b$15b2o6b2o12b2o$14bo3bo4b2o12b2o$3b2o8bo5bo3b2o14b$3b"
                      + "2o8bo3bob2o4bobo11b$13bo5bo7bo11b$14bo3bo20b$15b2o22b$26bo12b$27b2o10b"
                      + "$26b2o11b4$21b2o16b$9bobo10b2o15b$9bo2bo8bo17b$2o10b2o11b2o12b$2o8bo3b"
                      + "2o8bobo12b$5b2o5b2o9bo6b2o7b$4bo4bo2bo10bo2bo2bo2bo6b$9bobo11bo6b3o6b$"
                      + "24bobo5b3o4b$25b2o6bobo3b$35bo3b$35b2o!",
                 torodial : false };

      p[i++] = { name : "Newgun", 
                 xpos : 12,
                 ypos : 12,
                 rle  : "23b2o24b2o$23b2o24b2o$41b2o8b$40bo2bo7b$41b2o8b2$36b3o12b$36bobo12b$9b"
                      + "2o25b3o12b$9b2o25b2o13b$8bo2bo23b3o13b$8bo2bob2o20bobo13b$8bo4b2o20b3o"
                      + "13b$10b2ob2o36b$31b2o18b$21b2o7bo2bo17b$21b2o8b2o18b$49b2o$49b2o2$4b2o"
                      + "18bo26b$2o4b4o10b2o2b2ob3o21b$2o2b2ob3o10b2o4b4o21b$4bo19b2o!",
                 torodial : false };

      p[i++] = { name : "Block-laying switch engine ", 
                 xpos : 150,
                 ypos : 110,
                 rle  : "18bo10b$b3o8bo5bo10b$o3bo6bo7bo9b$b2o9b4o2b2o9b$3b2ob2o9b3o9b$5b2o11bo"
                      + "bo8b$19bo7b2o$19bo7b2o11$7b2o20b$7b2o20b7$15b2o12b$15b2o!",
                 torodial : true };
      return p;
    }


    function random_cells() {
      for (var i=0; i<cells_x; ++i) {
        for (var j=0; j<cells_y; ++j) {
          set_cell_value(i, j, Math.round(Math.random()));
        }
      }
      world_data[1].set(world_data[0]);
    }

    function clear_cells() {
      for (var i=0; i<cells_x; ++i) {
        for (var j=0; j<cells_y; ++j) {
          set_cell_value(i, j, 0);
        }
      }
      world_data[1].set(world_data[0]);
    }

    function rle_decode(xpos, ypos, str) {
      var buf = "";
      var line = "";
      
      var col = xpos;
      var row = ypos;      

      set_cell_value();
      for (var i=0; i<str.length; ++i) {
        var c = str[i];
        var n = 0;
 
        switch(c) {
        case 'b': // tote zelle
           n = (buf.length>0) ? parseInt(buf) : 1;		            
           buf = "";
           for (var k=0; k<n; ++k) {
             set_cell_value(col+k, row, 0);
             
           }
	   col += n;
           break;

        case 'o': // lebende zelle
           n = (buf.length>0) ? parseInt(buf) : 1;		            
           buf = "";
           for (var k=0; k<n; ++k) { 
             set_cell_value(col+k, row, 1);
           }  
	   col += n;
           break;

        case '$': // zeilenende
           n = (buf.length>0) ? parseInt(buf) : 1;
           buf = "";
           line = "";
           row+=n;
           col = xpos;
           break;

        case '!': // patternende
           buf = "";
           line = "";
           break;

        default:
           // zahl parsen
           buf += str[i];
           break;
        }
      }
    }

    function tick() {
      switch(cmd) {
      case "pat1":   init_with_pattern(presets[0]); break;
      case "pat2":   init_with_pattern(presets[1]); break;
      case "pat3":   init_with_pattern(presets[2]); break;
      case "pat4":   init_with_pattern(presets[3]); break;
      case "pat5":   init_with_pattern(presets[4]); break;
      case "pat6":   init_with_pattern(presets[5]); break;
      case "pat7":   init_with_pattern(presets[6]); break;
      case "pat8":   init_with_pattern(presets[7]); break;
      case "pat9":   init_with_pattern(presets[8]); break;
      case "pat10":  init_with_pattern(presets[9]); break;
      case "pat11":  init_with_pattern(presets[10]); break;
      case 'single': is_running = false;  
                     move(); 
                     draw(); 
                     break;
      case "run":    is_running = true; break;
      case "clear":  clear_cells();     break;
      case "random": random_cells();    break;
      case 'update': {
                       var c=document.getElementById('cbToroidal');
                       is_toroidal = c.checked;
                     }
                     break;

      default:  cmd ="";
                draw();
                if (is_running) {
                   move();
                }
		break;

      }

      cmd ="";
    }
 
    function move() {
      // copy world data
      world_data[1].set(world_data[0]);

      var ct = 0, v;
      for (var x=0; x<cells_x; ++x) {
        for (var y=0; y<cells_y; ++y) {
           // How many neighbor cells are alive?
           ct = 0;
           ct += get_cell_value(1, x-1, y-1);
           ct += get_cell_value(1, x,   y-1);
           ct += get_cell_value(1, x+1, y-1);
           ct += get_cell_value(1, x-1, y);
           ct += get_cell_value(1, x+1, y);
           ct += get_cell_value(1, x-1, y+1);
           ct += get_cell_value(1, x,   y+1);
           ct += get_cell_value(1, x+1, y+1);

           // cell value		
	   v = get_cell_value(1, x, y);           

           if (v==1) {		
		if (ct<2 || ct>3) {
                   // death by underpopulation
		   set_cell_value(x, y, 0);
                } else {
                   // Live to see another day
		   set_cell_value(x, y, 1);
                } 
           } else if (v==0) {
             if (ct==3) {
               // Give birth to a new cell
               set_cell_value(x, y, 1);
             } else {
               // remain dead
               set_cell_value(x, y, 0);
             }
           }
        } // for y ...
      } // for x ...
    }

    function draw() {
      ctxBack.putImageData(world_img,0,0);

      // Scale and copy to the main canvas. Then scale back
      ctx.scale(cell_width, cell_height);
      ctx.drawImage(cvBack, 0, 0);
      ctx.scale(1/cell_width, 1/cell_height);

      if (cell_width>2) {
        draw_grid();
      }
    }

    function draw_grid() {

      ctx.beginPath();
      for (var i=0; i<cells_x; ++i) {
          ctx.moveTo(i * cell_width, 0);
          ctx.lineTo(i * cell_width, cells_y * cell_height);
      }

      for (var j=0; j<cells_y; ++j) {
          ctx.moveTo(0, j * cell_height);
          ctx.lineTo(cells_x * cell_width, j* cell_height);
      }
      ctx.strokeStyle=colGrid;
      ctx.stroke();

      ctx.beginPath();
      for (var i=0; i<cells_x; i+=10) {
          ctx.moveTo(i * cell_width, 0);
          ctx.lineTo(i * cell_width, cells_y * cell_height);
      }

      for (var j=0; j<cells_y; j+=10) {
          ctx.moveTo(0, j * cell_height);
          ctx.lineTo(cells_x * cell_width, j* cell_height);
      }
      ctx.strokeStyle=colGrid2;
      ctx.stroke();
	
    }
 
    function set_cell_value(x, y, v) {
        world_data[0][y*cells_x + x] = v;
        if (v==0) {
          world_img.data[4*(y*cells_x + x)    ] =  rgbaDead[0]; //20;
          world_img.data[4*(y*cells_x + x) + 1] =  rgbaDead[1]; //20;
          world_img.data[4*(y*cells_x + x) + 2] =  rgbaDead[2]; //50;
          world_img.data[4*(y*cells_x + x) + 3] =  rgbaDead[3]; //255;
       } else {
          world_img.data[4*(y*cells_x + x)    ] = rgbaAlive[0]; //255;
          world_img.data[4*(y*cells_x + x) + 1] = rgbaAlive[1]; //255;
          world_img.data[4*(y*cells_x + x) + 2] = rgbaAlive[2]; //150;
          world_img.data[4*(y*cells_x + x) + 3] = rgbaAlive[3]; //255;
       }
    }

   function get_cell_value(i, x, y) {
        if (!is_toroidal) {
	  if (x<0 || x>=cells_x || y<0 || y>=cells_y) {
            return 0;
          }
        } else {
          if (x==-1) {
            x = cells_x -1;
          }

          if (x==cells_x) {
            x = 0;
          }

          if (y==-1) {
            y = cells_y -1;
          }

          if (y==cells_y) {
            y = 0;
          }
       }

       return  world_data[i][y*cells_x + x];
   }
}
