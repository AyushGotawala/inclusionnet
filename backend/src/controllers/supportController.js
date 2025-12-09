import prisma from '../lib/prisma.js';

// Create a new support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      category, 
      priority = 'medium', 
      subject, 
      description, 
      steps, 
      expectedBehavior, 
      actualBehavior 
    } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required'
      });
    }

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketId,
        userId,
        category,
        priority,
        subject,
        description,
        steps: steps || null,
        expectedBehavior: expectedBehavior || null,
        actualBehavior: actualBehavior || null,
        status: 'OPEN'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket,
      ticketId: ticket.ticketId
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all tickets for the current user
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [tickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          replies: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Get latest reply
          }
        }
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + tickets.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ticketId } = req.params;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        ticketId,
        userId // Ensure user can only access their own tickets
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add reply to ticket
export const addTicketReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check if ticket exists and belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        ticketId,
        userId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId: ticket.id,
        userId,
        message,
        isFromUser: true
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    // Update ticket's last activity
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { 
        updatedAt: new Date(),
        status: 'USER_REPLIED'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: reply
    });
  } catch (error) {
    console.error('Add ticket reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all tickets (Admin only)
export const getAllTickets = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, category, priority, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const skip = (page - 1) * limit;

    const [tickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          replies: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.supportTicket.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'All tickets retrieved successfully',
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + tickets.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update ticket status (Admin only)
export const updateTicketStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { ticketId } = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'USER_REPLIED', 'ADMIN_REPLIED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required',
        validStatuses
      });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { ticketId }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { ticketId },
      data: {
        status,
        adminNote: adminNote || ticket.adminNote,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null,
        resolvedBy: status === 'RESOLVED' || status === 'CLOSED' ? req.user.id : null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};