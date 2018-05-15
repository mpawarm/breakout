
//Global values
var paddle_speed=3;
var canvas_width=1000;
var canvas_height=1000;
var bg_color="#000000";
var paddle_width=200;
var paddle_height=5;
var ball_width=20;
var ball_height=20;
var ball_vx_init=3;
var ball_vy_init=1;
var crash=0;
var intervalID;
var maxRows=8;
var maxCols=14;
var bricks;
var colours = ["red","magenta","purple","#8B8386","pink","yellow","#00A308","#FF82AB","blue","orange","#00EE76","#EE7621"]
var score=0;
var lives=3;
var level=1;
var padding=0;
var top_row_broken=0;
var brick_width = Math.floor(canvas_width/maxCols);
var brick_height = Math.floor((canvas_height/4)/maxRows);
var brick_y_offset = 5;


function draw()
{

        var context=document.getElementById("panel").getContext("2d");
        //Set up the paddle as a simple rectangle
        var paddle=new Brick(canvas_width/2,canvas_height-paddle_height,paddle_width,paddle_height,"rgb(255,0,0)");
        //Give the canvas the ability to move horizontally on command, obeying the boundaries of the canvas
        paddle.move=function()
        {
                //Check if we've hit the right bound
                if(this.vx>0&&(this.x+this.width+this.vx)>canvas_width){this.x=canvas_width-this.width;this.vx=0;}
                //Check if we've hit the left bound
                if(this.vx<0&&(this.x+this.vx)<0){this.x=0;this.vx=0;}
                //Move with reckless disregard
                else{this.x+=this.vx;}
        };
        //Set up the ball as a square with some arbitrary speed values
        var ball=new Brick(canvas_width/2,canvas_height/2,ball_width,ball_height,"rgb(0,255,0)",ball_vx_init,ball_vy_init);
        //Give the ball the ability to move horizontally and vertically on command, obeying the boundaries of the canvas
        ball.move=function(paddle)
        {
                //Check if we've hit the right bound
                if(this.vx>0&&(this.x+this.width+this.vx)>canvas_width){this.x=canvas_width-this.width;this.vx*=-1;}
                //Check if we've hit the left bound
                else if(this.vx<0&&(this.x+this.vx)<0){this.x=0;this.vx*=-1;}
                //Move with reckless disregard
                else{this.x+=this.vx;}
                //Check if we've hit the bottom and if we have inform the user that they suck after resetting the ball
                if(this.vy>0&&(this.y+this.height+this.vy)>canvas_width){ crash=1; checkConditions(0,context,paddle,ball); }
                //Check if we've hit the top bound
                else if(this.vy<0&&(this.y+this.vy)<0){
                    this.y=0;this.vy*=-1;
                } 
                //Move with reckless disregard
                else{this.y+=this.vy;}
                if(this.y<(brick_height+brick_y_offset)&&!top_row_broken) 
                {
                        top_row_broken = 1;
                        paddle.width = paddle.width/2;
                        alert('Top row broken. Paddle size half!');
                }
                //Check if we've hit the paddle and bounce as appropriate
                if((this.y+this.height)>paddle.y&&(this.x+this.width)>paddle.x&&this.x<(paddle.x+paddle.width))
                {
                        var speedsq=Math.pow(this.vx,2)+Math.pow(this.vy,2);
                        this.vx=4*(((this.x+(this.width/2))-(paddle.x+(paddle.width/2)))/paddle.width);
                        this.vy=-1*Math.sqrt(speedsq-Math.pow(this.vx,2));

                }
        }
        ball.draw=function(context)
        {
                context.fillStyle=this.color;
                context.beginPath();
                        context.arc(this.x+(this.width/2),this.y+(this.height/2),this.width/2,0,2 * Math.PI,false);
                context.fill();
        }
        //List of bricks to (hopefully) be ht by the ball
        drawBricks();

        //Pass the paddle to keyup so it can control speed directly without making paddle global
        $("body").keyup(function(e){keyup(e,paddle);});
        //Pass the paddle to keydown so it can control speed directly without making paddle global
        $("body").keydown(function(e){keydown(e,paddle);});
        //Start the loop
        intervalID = setInterval(function(){iterate(context,paddle,ball);}, 1);
}

function checkConditions(condition,context,paddle,ball)
{
    if(crash){
        lives--;
        window.clearInterval(intervalID);
        updateStats(0); // Update lives
        var mssg = "You lost a life! " + lives + " lives remaining";
        alert(mssg);
        crash=0;
        if(lives <= 0){alert('End Game!');}
        else
        {
                ball.x=canvas_width/2;ball.y=canvas_height/2;ball.vx=ball_vx_init;ball.vy=ball_vy_init;
                intervalID=setInterval(function(){iterate(context,paddle,ball);}, 1);
        }
        return;
    } 

    if(condition){
        // Only two levels in the game!
        if(level==2){
            alert('YOU WON!!!!');
            return;
        }

        // level up. increase rows of bricks. decrease paddle speed.
        updateStats(1);
        window.clearInterval(intervalID);
        alert('LEVEL UP!');
        level++;
        maxRows += 2;
        paddle_speed -= 2;
        top_row_broken=0;
    }

    // Start drawing another game
    draw();
}

function updateStats(flag)
{
    switch(flag){
        case 0: document.getElementById("lives").innerHTML = lives; break;
        case 1: document.getElementById("level").innerHTML = level; break;
        default: document.getElementById("score").innerHTML = score;
    }
}

function drawBricks()
{
    bricks = new Array(maxCols*maxRows);
    var x_offset=0;
    var y_offset=brick_y_offset;
    var padding=1; 
    var count=0;
    for(i=0; i<maxRows; i++){
        x_offset=0;
        for(j=0; j<maxCols; j++){
            bricks[count] = new Brick(x_offset,y_offset,brick_width,brick_height,colours[i]);
            x_offset+=brick_width+padding;
            count++;
        }
        y_offset+=brick_height+padding;
    }

}


//Generic game object
function Brick(x,y,w,h,c,vx,vy)
{
        if(!vx){vx=0;}
        if(!vy){vy=0;}
        this.x=x;
        this.y=y;
        this.width=w;
        this.height=h;
        this.color=c;
        this.vx=vx;
        this.vy=vy;
        //Everything is a rectangle, so this works universally
        this.draw=function(context)
        {
                context.fillStyle=this.color;
                context.fillRect(this.x,this.y,this.width,this.height);
        }
        //Allow mobile objects (i.e., paddle and ball) the option to define how they move
        this.move=function(){};
}

//This function repeats endlessly to move the game forward
function iterate(context,paddle,ball)
{
    //Move the paddle and the ball with their predefined functions
    paddle.move();
    ball.move(paddle);
    //Clear the screen by drawing the background color over everything
    clear_panel(context);
    //Command the paddle and ball to draw themselves
    paddle.draw(context);
    ball.draw(context);

    //Loop through the remaining bricks
    for(var i in bricks)
    {
            //If the ball hit the brick, destroy it. check_collision handles the redirection of the ball
            if(check_collision(bricks[i],ball,paddle)){
                //delete bricks[i];
                bricks.splice(i, 1);
                score++;
                updateStats();
            }
            //Otherwise just draw it
            else{bricks[i].draw(context);}
    }

    if(bricks.length==0){
        checkConditions(1);
    }
    ball.vx+=0.0001*(ball.vx/Math.abs(ball.vx));
    ball.vy+=0.0001*(ball.vy/Math.abs(ball.vy));
}

//Returns whether or not the ball hit a brick after redirecting the ball appropriately
function check_collision(brick,ball,paddle)
{
        if(     (ball.x+ball.width)>brick.x &&
                ball.x<(brick.x+brick.width) &&
                (ball.y+ball.height)>brick.y &&
                ball.y<(brick.y+brick.height))
        {
                ball.vy*=-1;
                ball.move(paddle);
                return true;
        }
        return false;
}
//Draw the background color over the whole canvas to prepare for a new frame
function clear_panel(context)
{
        context.fillStyle=bg_color;
        context.fillRect(0,0,canvas_width,canvas_height);
}
//If the left or right arrow key comes down, send the paddle in that direction
function keydown(e,paddle)
{
        if(!e){e=window.event;}
        if(e.keyCode)
        {
                //Left arrow=37, Right arrow=39
                if(e.keyCode==37){paddle.vx=-1*paddle_speed;}
                if(e.keyCode==39){paddle.vx=paddle_speed;}
        }
}
//If the left or right arrow key comes up and that key was controlling the paddle, stop the motion
function keyup(e,paddle)
{
        if(!e){e=window.event;}
        if(e.keyCode)
        {
                if(e.keyCode==37&&paddle.vx<0){paddle.vx=0;}
                if(e.keyCode==39&&paddle.vx>0){paddle.vx=0;}
        }
}


